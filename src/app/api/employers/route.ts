export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withApiHandler, parseBody, getPaginationParams } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { EMPLOYER } from '@/lib/permissions/constants';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { createEmployerSchema } from '@/lib/validations/employer';
import { AuditService } from '@/lib/services/audit.service';

// ── GET /api/employers ──
// BD/Admin: list all employers (with optional filters)
// Employer role: list only their own employers

export const GET = withApiHandler(
  async (req: NextRequest, { user }) => {
    const { page, limit, skip } = getPaginationParams(req);
    const { searchParams } = new URL(req.url);

    const canViewAll = await AuthorizationService.can(
      { id: user!.id },
      EMPLOYER.VIEW_ALL
    );

    // Build filter clause
    const where: Record<string, unknown> = { deletedAt: null };

    // Status filter (BD/admin only)
    const statusFilter = searchParams.get('status');
    if (statusFilter && canViewAll) {
      where.verificationStatus = statusFilter;
    }

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Non-admin users can only see employers they are members of
    if (!canViewAll) {
      const memberships = await prisma.member.findMany({
        where: { userId: user!.id, employerId: { not: null } },
        select: { employerId: true },
      });

      const employerIds = memberships
        .map((m) => m.employerId)
        .filter((id): id is string => id !== null);

      if (employerIds.length === 0) {
        return {
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }

      where.id = { in: employerIds };
    }

    const [employers, total] = await Promise.all([
      prisma.employer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { jobs: true, members: true } },
        },
      }),
      prisma.employer.count({ where }),
    ]);

    return {
      data: employers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  { requireAuth: true }
);

// ── POST /api/employers ──
// Register a new employer organization.
// Creates the Employer record, a Member linking the caller, and assigns the EMPLOYER role.

export const POST = withApiHandler(
  async (req: NextRequest, { user }) => {
    const body = await parseBody(req, createEmployerSchema);

    // Check for duplicate company name to prevent confusion
    const existing = await prisma.employer.findFirst({
      where: {
        companyName: body.companyName,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictError(
        `An employer with the name "${body.companyName}" already exists`
      );
    }

    // Look up the EMPLOYER role for assignment
    const employerRole = await prisma.role.findFirst({
      where: { name: 'EMPLOYER', scope: 'EMPLOYER' },
    });

    if (!employerRole) {
      throw new NotFoundError('Role', 'EMPLOYER');
    }

    // Create employer, member, and role assignment in a transaction
    const employer = await prisma.$transaction(async (tx) => {
      const newEmployer = await tx.employer.create({
        data: {
          companyName: body.companyName,
          companySector: body.companySector,
          companySize: body.companySize,
          website: body.website,
          logoUrl: body.logoUrl,
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          verificationStatus: 'PENDING',
        },
      });

      // Create member record linking user to employer
      const member = await tx.member.create({
        data: {
          userId: user!.id,
          employerId: newEmployer.id,
        },
      });

      // Assign the EMPLOYER role to the member
      await tx.memberRole.create({
        data: {
          memberId: member.id,
          roleId: employerRole.id,
        },
      });

      return newEmployer;
    });

    // Clear authorization cache so new permissions take effect immediately
    AuthorizationService.clearCache(user!.id);

    // Audit log
    await AuditService.log({
      eventType: 'EMPLOYER_REGISTERED',
      entityType: 'Employer',
      entityId: employer.id,
      actorUserId: user!.id,
      afterState: {
        companyName: employer.companyName,
        companySector: employer.companySector,
        companySize: employer.companySize,
        contactEmail: employer.contactEmail,
        verificationStatus: employer.verificationStatus,
      },
      metadata: { source: 'api' },
    });

    return { data: employer };
  },
  { requireAuth: true }
);
