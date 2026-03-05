import { api } from './client';
import { FieldConsents, EmployerOverride } from '@/types';

export interface ConsentData {
  id: string;
  profileId: string;
  fieldConsents: FieldConsents;
  employerOverrides: EmployerOverride[];
  consentVersion: number;
  updatedAt: string;
}

export const consentApi = {
  get: () => api.get<ConsentData>('/api/consent'),
  update: (fieldConsents: Partial<FieldConsents>) => api.put<ConsentData>('/api/consent', fieldConsents),
  grantOverride: (data: { employerId: string; grantedFields: string[]; expiresInDays?: number }) =>
    api.post<ConsentData>('/api/consent', { action: 'grant_override', ...data }),
  revokeOverride: (employerId: string) =>
    api.post<ConsentData>('/api/consent', { action: 'revoke_override', employerId }),
};
