import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.enum(['INTERNSHIP', 'PLACEMENT', 'FULL_TIME', 'CONTRACT']),
  domain: z.string().min(1).max(128),
  requiredSkills: z.array(z.string()).min(1),
  preferredSkills: z.array(z.string()).optional().default([]),
  location: z.string().max(255).optional(),
  remote: z.boolean().optional().default(false),
  salaryRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().length(3),
    })
    .optional(),
  openPositions: z.number().int().min(1).optional().default(1),
  screeningRequired: z.boolean().optional().default(false),
  screeningSkillIds: z.array(z.string()).optional().default([]),
  closesAt: z.string().datetime().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'FILLED']),
});
