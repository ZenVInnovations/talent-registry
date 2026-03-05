import { z } from 'zod';

export const createEmployerSchema = z.object({
  companyName: z.string().min(1).max(255),
  companySector: z.string().min(1).max(128),
  companySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']),
  website: z.union([z.string().url(), z.literal('')]).optional().transform(v => v || undefined),
  logoUrl: z.union([z.string().url(), z.literal('')]).optional().transform(v => v || undefined),
  contactName: z.string().min(1).max(255),
  contactEmail: z.string().email(),
  contactPhone: z.union([z.string().max(20), z.literal('')]).optional().transform(v => v || undefined),
});

export const updateEmployerSchema = createEmployerSchema.partial();

export const verifyEmployerSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  bdAssigneeUserId: z.string().optional(),
});
