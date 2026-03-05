'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { useConsent, useUpdateConsent } from '@/hooks/useConsent';
import { Spinner } from '@/components/ui/spinner';
import type { FieldConsents } from '@/types';

const CONSENT_FIELDS: { key: keyof FieldConsents; label: string; description: string }[] = [
  { key: 'fullName', label: 'Full Name', description: 'Your full name visible to employers' },
  { key: 'email', label: 'Email Address', description: 'Your email visible to employers' },
  { key: 'phone', label: 'Phone Number', description: 'Your phone number visible to employers' },
  { key: 'institution', label: 'Institution', description: 'Your institution name visible to employers' },
  { key: 'domains', label: 'Domains', description: 'Your skill domains visible to employers' },
  { key: 'skillBadges', label: 'Skill Badges', description: 'Your earned badges visible to employers' },
  { key: 'projectCount', label: 'Project Count', description: 'Number of completed projects visible' },
  { key: 'projectDetails', label: 'Project Details', description: 'Detailed project information visible' },
  { key: 'certificateDetails', label: 'Certificate Details', description: 'Certificate information visible' },
  { key: 'screeningScores', label: 'Screening Scores', description: 'Assessment scores visible to employers' },
  { key: 'resumeUrl', label: 'Resume/CV', description: 'Your resume link visible to employers' },
];

export function ConsentToggles() {
  const { data: consent, isLoading } = useConsent();
  const { mutate: updateConsent, isPending } = useUpdateConsent();
  const [consents, setConsents] = useState<Partial<FieldConsents>>({});

  useEffect(() => {
    if (consent?.fieldConsents) setConsents(consent.fieldConsents);
  }, [consent]);

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const handleToggle = (key: keyof FieldConsents, value: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sharing Preferences</CardTitle>
        <CardDescription>Control what information employers can see about your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {CONSENT_FIELDS.map((field) => (
          <Toggle
            key={field.key}
            checked={consents[field.key] ?? false}
            onChange={(v) => handleToggle(field.key, v)}
            label={field.label}
            description={field.description}
          />
        ))}
        <div className="flex justify-end pt-2">
          <Button onClick={() => updateConsent(consents)} loading={isPending}>
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
