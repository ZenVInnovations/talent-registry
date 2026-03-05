import { z } from 'zod';

export const createPlacementSchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(['INTERNSHIP', 'PLACEMENT', 'FULL_TIME', 'CONTRACT']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  sourceOpportunityId: z.string().optional(),
});

export const updatePlacementSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'TERMINATED']).optional(),
  endDate: z.string().datetime().optional(),
});
