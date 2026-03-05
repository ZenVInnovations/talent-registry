import { z } from 'zod';

export const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(5000).optional(),
  customAnswers: z.record(z.string(), z.string()).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'UNDER_REVIEW',
    'SCREENING_REQUESTED',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'OFFERED',
    'ACCEPTED',
    'DECLINED_BY_STUDENT',
    'REJECTED',
    'WITHDRAWN',
  ]),
  reason: z.string().max(1000).optional(),
});
