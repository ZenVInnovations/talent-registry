-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('GLOBAL', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('INTERNSHIP', 'PLACEMENT', 'FULL_TIME', 'CONTRACT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SCREENING_REQUESTED', 'SCREENING_COMPLETED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'ACCEPTED', 'DECLINED_BY_STUDENT', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "scope" "RoleScope" NOT NULL DEFAULT 'GLOBAL',
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberRole" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "MemberRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permission" VARCHAR(100) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anonymizedId" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "institutionId" TEXT,
    "institutionName" TEXT,
    "domains" TEXT[],
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "completedProjectIds" TEXT[],
    "technologies" TEXT[],
    "badgeSummary" JSONB,
    "skillScores" JSONB,
    "certificateCount" INTEGER NOT NULL DEFAULT 0,
    "resumeUrl" TEXT,
    "profileVisible" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "fieldConsents" JSONB NOT NULL,
    "employerOverrides" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companySector" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "bdAssigneeUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "domain" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "salaryRange" JSONB,
    "openPositions" INTEGER NOT NULL DEFAULT 1,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceOpportunityId" TEXT,
    "externalSourceId" TEXT,
    "externalSourceName" TEXT,
    "screeningRequired" BOOLEAN NOT NULL DEFAULT false,
    "screeningSkillIds" TEXT[],
    "postedAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coverLetter" TEXT,
    "customAnswers" JSONB,
    "matchScoreAtApply" DECIMAL(5,2),
    "screeningId" TEXT,
    "screeningScore" DECIMAL(5,2),
    "statusHistory" JSONB NOT NULL DEFAULT '[]',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "dimensionScores" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "stale" BOOLEAN NOT NULL DEFAULT false,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PlacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "sourceOpportunityId" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "eventType" VARCHAR(256) NOT NULL,
    "entityType" VARCHAR(128) NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRole" VARCHAR(64),
    "actorIp" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "metadata" JSONB,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedEvent" (
    "id" TEXT NOT NULL,
    "consumerGroup" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionJobRun" (
    "id" TEXT NOT NULL,
    "runStartedAt" TIMESTAMP(3) NOT NULL,
    "runCompletedAt" TIMESTAMP(3),
    "phase" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsAnonymized" INTEGER NOT NULL DEFAULT 0,
    "recordsDeleted" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',

    CONSTRAINT "RetentionJobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "userId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsApplicationDaily" (
    "date" DATE NOT NULL,
    "employerId" TEXT NOT NULL,
    "domain" VARCHAR(128) NOT NULL,
    "institutionBucket" VARCHAR(128) NOT NULL,
    "applicationCount" INTEGER NOT NULL DEFAULT 0,
    "shortlistedCount" INTEGER NOT NULL DEFAULT 0,
    "offeredCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "avgMatchScore" DECIMAL(5,2),

    CONSTRAINT "AnalyticsApplicationDaily_pkey" PRIMARY KEY ("date","employerId","domain","institutionBucket")
);

-- CreateTable
CREATE TABLE "AnalyticsPlacementMonthly" (
    "month" DATE NOT NULL,
    "employerSector" VARCHAR(128) NOT NULL,
    "domain" VARCHAR(128) NOT NULL,
    "placementType" VARCHAR(32) NOT NULL,
    "placementCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnalyticsPlacementMonthly_pkey" PRIMARY KEY ("month","employerSector","domain","placementType")
);

-- CreateTable
CREATE TABLE "AnalyticsSkillDemandWeekly" (
    "weekStart" DATE NOT NULL,
    "skillName" VARCHAR(256) NOT NULL,
    "jobsRequiring" INTEGER NOT NULL DEFAULT 0,
    "applicationsWith" INTEGER NOT NULL DEFAULT 0,
    "avgScore" DECIMAL(5,2),

    CONSTRAINT "AnalyticsSkillDemandWeekly_pkey" PRIMARY KEY ("weekStart","skillName")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_employerId_key" ON "Member"("userId", "employerId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRole_memberId_roleId_key" ON "MemberRole"("memberId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permission_key" ON "RolePermission"("roleId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_anonymizedId_key" ON "StudentProfile"("anonymizedId");

-- CreateIndex
CREATE INDEX "StudentProfile_institutionId_idx" ON "StudentProfile"("institutionId");

-- CreateIndex
CREATE INDEX "StudentProfile_profileVisible_idx" ON "StudentProfile"("profileVisible");

-- CreateIndex
CREATE INDEX "StudentProfile_deletedAt_idx" ON "StudentProfile"("deletedAt");

-- CreateIndex
CREATE INDEX "Consent_profileId_version_idx" ON "Consent"("profileId", "version" DESC);

-- CreateIndex
CREATE INDEX "Employer_verificationStatus_idx" ON "Employer"("verificationStatus");

-- CreateIndex
CREATE INDEX "Employer_deletedAt_idx" ON "Employer"("deletedAt");

-- CreateIndex
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_domain_idx" ON "Job"("domain");

-- CreateIndex
CREATE INDEX "Job_deletedAt_idx" ON "Job"("deletedAt");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_profileId_idx" ON "Application"("profileId");

-- CreateIndex
CREATE INDEX "Application_employerId_idx" ON "Application"("employerId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_deletedAt_idx" ON "Application"("deletedAt");

-- CreateIndex
CREATE INDEX "MatchScore_overallScore_idx" ON "MatchScore"("overallScore" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_jobId_profileId_key" ON "MatchScore"("jobId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_applicationId_key" ON "Placement"("applicationId");

-- CreateIndex
CREATE INDEX "Placement_status_idx" ON "Placement"("status");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_eventType_createdAt_idx" ON "AuditLog"("eventType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProcessedEvent_processedAt_idx" ON "ProcessedEvent"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedEvent_consumerGroup_idempotencyKey_key" ON "ProcessedEvent"("consumerGroup", "idempotencyKey");

-- CreateIndex
CREATE INDEX "RetentionJobRun_status_runStartedAt_idx" ON "RetentionJobRun"("status", "runStartedAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
