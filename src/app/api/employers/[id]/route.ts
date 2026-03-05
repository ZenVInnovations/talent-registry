export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withApiHandler, parseBody } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { AuthorizationService } from '@/lib/authorization/service';
import { EMPLOYER } from '@/lib/permissions/constants';
import { NotFoundError, AuthorizationError, ValidationError } from '@/lib/errors';
import { updateEmployerSchema, verifyEmployerSchema } from '@/lib/validations/employer';
import { AuditService } from '@/lib/services/audit.service';
import { NotificationService, NOTIFICATION_TYPES } from '@/lib/services/notification.service';
import { enqueueJob, EMAIL_JOB_TYPES } from '@/lib/jobs';

// ── Helpers ──

async function findEmployerOrThrow(id: string) {
  const employer = await prisma.employer.findFirst({
    where: { id, deletedAt: null },
    include: {
      members: { select: { userId: true } },
    },
  });

  if (!employer) {
    throw new NotFoundError('Employer', id);
  }

  return employer;
}

async function isEmployerMember(userId: string, employerId: string): Promise<boolean> {
  const membership = await prisma.member.findFirst({
    where: { userId, employerId },
  });
  return !!membership;
}

// ── GET /api/employers/[id] ──
// Retrieve a single employer by ID.
// BD/admin can view any employer. Employer members can view their own.

export const GET = withApiHandler(
  async (_req: NextRequest, { user, params }) => {
    const { id } = params;
    await findEmployerOrThrow(id);

    const canViewAll = await AuthorizationService.can(
      { id: user!.id },
      EMPLOYER.VIEW_ALL
    );

    if (!canViewAll) {
      const isMember = await isEmployerMember(user!.id, id);
      if (!isMember) {
        throw new AuthorizationError(
          'You do not have permission to view this employer'
        );
      }
    }

    // Fetch full details with related counts
    const employerDetail = await prisma.employer.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, name: true, email: true, image: true } },
            memberRoles: {
              include: { role: { select: { id: true, name: true } } },
            },
          },
        },
        _count: {
          select: { jobs: true, applications: true },
        },
      },
    });

    return { data: employerDetail };
  },
  { requireAuth: true }
);

// ── PATCH /api/employers/[id] ──
// Update employer details (owner member or BD/admin).

export const PATCH = withApiHandler(
  async (req: NextRequest, { user, params }) => {
    const { id } = params;
    const employer = await findEmployerOrThrow(id);

    // Permission: employer member OR BD/admin with VIEW_ALL
    const canViewAll = await AuthorizationService.can(
      { id: user!.id },
      EMPLOYER.VIEW_ALL
    );
    const isMember = await isEmployerMember(user!.id, id);

    if (!canViewAll && !isMember) {
      throw new AuthorizationError(
        'You do not have permission to update this employer'
      );
    }

    const body = await parseBody(req, updateEmployerSchema);

    // Capture before-state for audit
    const beforeState = {
      companyName: employer.companyName,
      companySector: employer.companySector,
      companySize: employer.companySize,
      website: employer.website,
      logoUrl: employer.logoUrl,
      contactName: employer.contactName,
      contactEmail: employer.contactEmail,
      contactPhone: employer.contactPhone,
    };

    const updated = await prisma.employer.update({
      where: { id },
      data: body,
    });

    // Audit log
    await AuditService.log({
      eventType: 'EMPLOYER_UPDATED',
      entityType: 'Employer',
      entityId: id,
      actorUserId: user!.id,
      beforeState,
      afterState: {
        companyName: updated.companyName,
        companySector: updated.companySector,
        companySize: updated.companySize,
        website: updated.website,
        logoUrl: updated.logoUrl,
        contactName: updated.contactName,
        contactEmail: updated.contactEmail,
        contactPhone: updated.contactPhone,
      },
      metadata: { updatedFields: Object.keys(body) },
    });

    return { data: updated };
  },
  { requireAuth: true }
);

// ── POST /api/employers/[id] ──
// Action-based endpoint. Currently supports action=verify for BD verification workflow.
//
// Body: { action: "verify", status: "APPROVED" | "REJECTED", bdAssigneeUserId?: string }
//
// On APPROVED/REJECTED:
//   - Updates verificationStatus, verifiedByUserId, verifiedAt
//   - Creates audit log entry
//   - Enqueues email notification
//   - Sends in-app notification via NotificationService

export const POST = withApiHandler(
  async (req: NextRequest, { user, params }) => {
    const { id } = params;

    const rawBody = await req.json();
    const action = rawBody?.action;

    if (action === 'verify') {
      return handleVerify(id, rawBody, user!.id);
    }

    throw new ValidationError('Invalid action', {
      action: ['Supported actions: verify'],
    });
  },
  { requireAuth: true }
);

// ── Verify / Reject employer ──

async function handleVerify(
  employerId: string,
  rawBody: unknown,
  actorUserId: string
) {
  // Check BD/admin permission
  const canVerify = await AuthorizationService.can(
    { id: actorUserId },
    EMPLOYER.VERIFY
  );

  if (!canVerify) {
    throw new AuthorizationError(
      'You do not have permission to verify employers'
    );
  }

  // Validate the verify-specific fields (status, bdAssigneeUserId)
  const result = verifyEmployerSchema.safeParse(rawBody);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    throw new ValidationError('Validation failed', details);
  }

  const { status, bdAssigneeUserId } = result.data;

  const employer = await prisma.employer.findFirst({
    where: { id: employerId, deletedAt: null },
    include: {
      members: { select: { userId: true } },
    },
  });

  if (!employer) {
    throw new NotFoundError('Employer', employerId);
  }

  // Capture before-state
  const beforeState = {
    verificationStatus: employer.verificationStatus,
    verifiedByUserId: employer.verifiedByUserId,
    verifiedAt: employer.verifiedAt,
    bdAssigneeUserId: employer.bdAssigneeUserId,
  };

  const now = new Date();

  // Update employer verification status
  const updated = await prisma.employer.update({
    where: { id: employerId },
    data: {
      verificationStatus: status,
      verifiedByUserId: actorUserId,
      verifiedAt: now,
      ...(bdAssigneeUserId !== undefined ? { bdAssigneeUserId } : {}),
    },
  });

  // Audit log
  await AuditService.log({
    eventType: status === 'APPROVED' ? 'EMPLOYER_VERIFIED' : 'EMPLOYER_REJECTED',
    entityType: 'Employer',
    entityId: employerId,
    actorUserId,
    beforeState,
    afterState: {
      verificationStatus: updated.verificationStatus,
      verifiedByUserId: updated.verifiedByUserId,
      verifiedAt: updated.verifiedAt,
      bdAssigneeUserId: updated.bdAssigneeUserId,
    },
    metadata: { decision: status },
  });

  // Enqueue email notification to the employer's contact
  await enqueueJob(EMAIL_JOB_TYPES.EMPLOYER_VERIFICATION, {
    email: employer.contactEmail,
    companyName: employer.companyName,
    status,
  });

  // Send in-app notification to all employer members
  const notificationType =
    status === 'APPROVED'
      ? NOTIFICATION_TYPES.EMPLOYER_VERIFIED
      : NOTIFICATION_TYPES.EMPLOYER_REJECTED;

  const notificationTitle =
    status === 'APPROVED'
      ? 'Employer account approved'
      : 'Employer account rejected';

  const notificationMessage =
    status === 'APPROVED'
      ? `Your company "${employer.companyName}" has been verified. You can now post jobs and browse talent.`
      : `Your company "${employer.companyName}" verification was not approved. Please contact support for details.`;

  const memberNotifications = employer.members.map((member) => ({
    type: notificationType,
    title: notificationTitle,
    message: notificationMessage,
    link: `/employer/${employerId}`,
    userId: member.userId,
    metadata: { employerId, status },
  }));

  if (memberNotifications.length > 0) {
    await NotificationService.createBulk(memberNotifications);
  }

  return { data: updated };
}
