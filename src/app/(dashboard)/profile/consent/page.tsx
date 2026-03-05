'use client';

import { ConsentToggles } from '@/components/profile/consent-toggles';

export default function ConsentPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Privacy & Consent</h1>
        <p className="text-muted-foreground">Control how your data is shared with employers</p>
      </div>
      <ConsentToggles />
    </div>
  );
}
