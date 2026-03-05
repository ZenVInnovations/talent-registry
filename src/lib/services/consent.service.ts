import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { FieldConsents, EmployerOverride } from '@/types';
import { NotFoundError } from '../errors';

type JsonValue = Prisma.InputJsonValue;

const DEFAULT_FIELD_CONSENTS: FieldConsents = {
  fullName: false,
  email: false,
  phone: false,
  institution: true,
  domains: true,
  skillBadges: true,
  projectCount: true,
  projectDetails: false,
  certificateDetails: false,
  screeningScores: false,
  resumeUrl: false,
};

const ANONYMIZED_FIELDS = new Set([
  'anonymizedId',
  'institutionName',
  'domains',
  'projectCount',
  'certificateCount',
]);

const CONSENT_TO_PROFILE_FIELD: Record<string, string[]> = {
  fullName: ['displayName'],
  email: ['email'],
  phone: ['phone'],
  institution: ['institutionId', 'institutionName'],
  domains: ['domains'],
  skillBadges: ['skillScores', 'badgeSummary'],
  projectCount: ['projectCount'],
  projectDetails: ['completedProjectIds', 'technologies'],
  certificateDetails: ['certificateCount'],
  screeningScores: [],
  resumeUrl: ['resumeUrl'],
};

export const ConsentService = {
  getDefaultConsents(): FieldConsents {
    return { ...DEFAULT_FIELD_CONSENTS };
  },

  async getCurrentConsent(profileId: string) {
    const consent = await prisma.consent.findFirst({
      where: { profileId },
      orderBy: { version: 'desc' },
    });

    if (!consent) {
      return {
        fieldConsents: DEFAULT_FIELD_CONSENTS,
        employerOverrides: [] as EmployerOverride[],
        version: 0,
      };
    }

    return {
      fieldConsents: consent.fieldConsents as unknown as FieldConsents,
      employerOverrides: (consent.employerOverrides as unknown as EmployerOverride[]) || [],
      version: consent.version,
    };
  },

  async updateConsent(
    profileId: string,
    fieldConsents: Partial<FieldConsents>,
    actorUserId: string
  ) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });
    if (!profile) throw new NotFoundError('StudentProfile', profileId);

    const current = await this.getCurrentConsent(profileId);
    const merged: FieldConsents = { ...current.fieldConsents, ...fieldConsents };
    const newVersion = current.version + 1;

    const consent = await prisma.consent.create({
      data: {
        profileId,
        fieldConsents: merged as unknown as JsonValue,
        employerOverrides: (current.employerOverrides as unknown as JsonValue) ?? undefined,
        version: newVersion,
      },
    });

    await prisma.studentProfile.update({
      where: { id: profileId },
      data: { consentVersion: newVersion },
    });

    const { AuditService } = await import('./audit.service');
    await AuditService.log({
      eventType: 'consent.updated',
      entityType: 'Consent',
      entityId: consent.id,
      actorUserId,
      beforeState: current.fieldConsents as unknown as Record<string, unknown>,
      afterState: merged as unknown as Record<string, unknown>,
    });

    return consent;
  },

  async grantEmployerOverride(
    profileId: string,
    employerId: string,
    grantedFields: string[],
    actorUserId: string,
    expiresInDays = 90
  ) {
    const current = await this.getCurrentConsent(profileId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

    const override: EmployerOverride = {
      employerId,
      grantedFields,
      grantedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const overrides = (current.employerOverrides || []).filter(
      (o: EmployerOverride) => o.employerId !== employerId
    );
    overrides.push(override);

    const newVersion = current.version + 1;

    await prisma.consent.create({
      data: {
        profileId,
        fieldConsents: current.fieldConsents as unknown as JsonValue,
        employerOverrides: overrides as unknown as JsonValue,
        version: newVersion,
      },
    });

    await prisma.studentProfile.update({
      where: { id: profileId },
      data: { consentVersion: newVersion },
    });

    const { AuditService } = await import('./audit.service');
    await AuditService.log({
      eventType: 'consent.employer_override_granted',
      entityType: 'Consent',
      entityId: profileId,
      actorUserId,
      afterState: { override } as unknown as Record<string, unknown>,
    });
  },

  async revokeEmployerOverride(
    profileId: string,
    employerId: string,
    actorUserId: string
  ) {
    const current = await this.getCurrentConsent(profileId);
    const overrides = (current.employerOverrides || []).filter(
      (o: EmployerOverride) => o.employerId !== employerId
    );

    const newVersion = current.version + 1;

    await prisma.consent.create({
      data: {
        profileId,
        fieldConsents: current.fieldConsents as unknown as JsonValue,
        employerOverrides: overrides as unknown as JsonValue,
        version: newVersion,
      },
    });

    await prisma.studentProfile.update({
      where: { id: profileId },
      data: { consentVersion: newVersion },
    });

    const { AuditService } = await import('./audit.service');
    await AuditService.log({
      eventType: 'consent.employer_override_revoked',
      entityType: 'Consent',
      entityId: profileId,
      actorUserId,
      metadata: { employerId },
    });
  },

  filterProfileByConsent(
    profile: Record<string, unknown>,
    viewerRole: 'STUDENT_SELF' | 'EMPLOYER_BROWSING' | 'EMPLOYER_REVIEWING' | 'INTERNAL',
    fieldConsents: FieldConsents,
    employerOverrides: EmployerOverride[],
    employerId?: string
  ): Record<string, unknown> {
    if (viewerRole === 'STUDENT_SELF' || viewerRole === 'INTERNAL') {
      return profile;
    }

    if (viewerRole === 'EMPLOYER_BROWSING') {
      const filtered: Record<string, unknown> = {};
      for (const field of Array.from(ANONYMIZED_FIELDS)) {
        if (field in profile) {
          filtered[field] = profile[field];
        }
      }
      if (fieldConsents.skillBadges && profile.badgeSummary) {
        filtered.badgeSummary = profile.badgeSummary;
      }
      return filtered;
    }

    if (viewerRole === 'EMPLOYER_REVIEWING') {
      const filtered: Record<string, unknown> = {};

      for (const field of Array.from(ANONYMIZED_FIELDS)) {
        if (field in profile) {
          filtered[field] = profile[field];
        }
      }

      for (const [consentField, profileFields] of Object.entries(CONSENT_TO_PROFILE_FIELD)) {
        const consented = fieldConsents[consentField as keyof FieldConsents];
        if (consented) {
          for (const pf of profileFields) {
            if (pf in profile) {
              filtered[pf] = profile[pf];
            }
          }
        }
      }

      if (employerId) {
        const override = employerOverrides.find(
          (o) => o.employerId === employerId && new Date(o.expiresAt) > new Date()
        );
        if (override) {
          for (const field of override.grantedFields) {
            const profileFields = CONSENT_TO_PROFILE_FIELD[field];
            if (profileFields) {
              for (const pf of profileFields) {
                if (pf in profile) {
                  filtered[pf] = profile[pf];
                }
              }
            }
          }
        }
      }

      return filtered;
    }

    return {};
  },
};
