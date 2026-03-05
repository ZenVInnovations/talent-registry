import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).optional(),
  domains: z.array(z.string()).optional(),
  resumeUrl: z.string().url().optional().nullable(),
  profileVisible: z.boolean().optional(),
});

export const updateConsentSchema = z.object({
  fullName: z.boolean().optional(),
  email: z.boolean().optional(),
  phone: z.boolean().optional(),
  institution: z.boolean().optional(),
  domains: z.boolean().optional(),
  skillBadges: z.boolean().optional(),
  projectCount: z.boolean().optional(),
  projectDetails: z.boolean().optional(),
  certificateDetails: z.boolean().optional(),
  screeningScores: z.boolean().optional(),
  resumeUrl: z.boolean().optional(),
});

export const employerOverrideSchema = z.object({
  employerId: z.string().min(1),
  grantedFields: z.array(z.string()).min(1),
  expiresInDays: z.number().min(1).max(365).optional(),
});
