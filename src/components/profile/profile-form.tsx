'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Tag } from '@/components/ui/tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateProfile } from '@/hooks/useProfile';
import type { Profile } from '@/lib/api/profiles';

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone || '');
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || '');
  const [profileVisible, setProfileVisible] = useState(profile.profileVisible);
  const { mutate: update, isPending } = useUpdateProfile();

  useEffect(() => {
    setDisplayName(profile.displayName);
    setPhone(profile.phone || '');
    setResumeUrl(profile.resumeUrl || '');
    setProfileVisible(profile.profileVisible);
  }, [profile]);

  const handleSave = () => {
    update({ id: profile.id, data: { displayName, phone: phone || undefined, resumeUrl: resumeUrl || null, profileVisible } });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Resume URL</label>
            <Input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://..." type="url" />
          </div>
          <Toggle
            checked={profileVisible}
            onChange={setProfileVisible}
            label="Profile Visible"
            description="Allow employers to discover your profile in talent search"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills & Background</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Domains</p>
            <div className="flex flex-wrap gap-1">
              {profile.domains.length > 0 ? profile.domains.map((d) => <Tag key={d} variant="primary">{d}</Tag>) : <p className="text-sm text-muted-foreground">No domains set</p>}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Technologies</p>
            <div className="flex flex-wrap gap-1">
              {profile.technologies.length > 0 ? profile.technologies.map((t) => <Tag key={t}>{t}</Tag>) : <p className="text-sm text-muted-foreground">No technologies recorded</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold">{profile.projectCount}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold">{profile.certificateCount}</p>
              <p className="text-xs text-muted-foreground">Certificates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={isPending}>Save Changes</Button>
      </div>
    </div>
  );
}
