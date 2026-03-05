// ── Domain Event Types ──

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: string;
  actorUserId: string | null;
  entityType: string;
  entityId: string;
  idempotencyKey: string;
  correlationId: string;
  causationId: string | null;
  version: number;
  payload: T;
}

// ── Inbound: From Flutto ──

export interface ZenCubeUserUpdatedPayload {
  userId: string;
  displayName: string;
  email: string;
  institutionId: string | null;
  institutionName: string | null;
  roles: string[];
  updatedFields: string[];
}

export interface ZenCubeProjectCompletedPayload {
  projectId: string;
  projectName: string;
  tenantId: string;
  completedAt: string;
  teamMemberUserIds: string[];
  domain: string;
  technologies: string[];
  deliverableCount: number;
}

// ── Inbound: From Challenge Registry ──

export interface ChallengeOpportunityCreatedPayload {
  opportunityId: string;
  challengeId: string;
  type: 'INTERNSHIP' | 'PLACEMENT';
  title: string;
  organizationName: string;
  skillRequirements: string[];
  count: number;
  status: 'OFFERED' | 'IN_DISCUSSION';
}

export interface ChallengeCertificateIssuedPayload {
  certificateId: string;
  challengeId: string;
  userId: string;
  projectId: string;
  certificateType: string;
  issuedAt: string;
}

export interface ChallengePortfolioAcceptedPayload {
  portfolioProjectId: string;
  challengeId: string;
  userId: string;
  projectType: 'nano' | 'medium' | 'capstone';
  title: string;
  domain: string;
  technologies: string[];
  acceptedAt: string;
}

// ── Inbound: From ZenYa ──

export interface ZenYaSkillScoredPayload {
  userId: string;
  skillTaxonomyId: string;
  skillName: string;
  skillCategory: string;
  score: number;
  confidence: number;
  evidence: { sourceType: string; sourceId: string; weight: number }[];
}

export interface ZenYaBadgeAwardedPayload {
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  awardedAt: string;
}

export interface ZenYaScreeningCompletedPayload {
  userId: string;
  screeningId: string;
  jobId: string | null;
  overallScore: number;
  sectionScores: { section: string; score: number; maxScore: number }[];
  completedAt: string;
}

// ── Outbound: From Talent Registry ──

export interface TalentApplicationSubmittedPayload {
  applicationId: string;
  jobId: string;
  profileId: string;
  userId: string;
  employerId: string;
  matchScore: number | null;
  submittedAt: string;
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SCREENING_REQUESTED'
  | 'SCREENING_COMPLETED'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'DECLINED_BY_STUDENT'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface TalentApplicationStatusChangedPayload {
  applicationId: string;
  jobId: string;
  userId: string;
  employerId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedBy: string;
  changedAt: string;
}

export interface TalentPlacementRecordedPayload {
  placementId: string;
  applicationId: string;
  jobId: string;
  userId: string;
  employerId: string;
  type: 'INTERNSHIP' | 'PLACEMENT' | 'FULL_TIME' | 'CONTRACT';
  startDate: string;
  sourceOpportunityId: string | null;
}

export interface TalentMatchComputedPayload {
  matchId: string;
  jobId: string;
  profileId: string;
  overallScore: number;
  dimensionScores: { dimension: string; score: number; weight: number; evidence: string }[];
  explanation: string;
}

// ── Consent Types ──

export interface FieldConsents {
  fullName: boolean;
  email: boolean;
  phone: boolean;
  institution: boolean;
  domains: boolean;
  skillBadges: boolean;
  projectCount: boolean;
  projectDetails: boolean;
  certificateDetails: boolean;
  screeningScores: boolean;
  resumeUrl: boolean;
}

export interface EmployerOverride {
  employerId: string;
  grantedFields: string[];
  grantedAt: string;
  expiresAt: string;
}

// ── Match Types ──

export interface MatchDimensionScore {
  dimension: string;
  score: number;
  weight: number;
  evidence: string;
}

export interface JobRequirements {
  jobId: string;
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  type: string;
}

export interface CandidateProfile {
  profileId: string;
  domains: string[];
  technologies: string[];
  skillScores: Record<string, number>;
  badgeSummary: Record<string, string>;
  projectCount: number;
  certificateCount: number;
}

// ── API Types ──

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
