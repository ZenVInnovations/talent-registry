'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfile } from '@/hooks/useProfile';
import { ProfileForm } from '@/components/profile/profile-form';
import { Spinner } from '@/components/ui/spinner';

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(user?.id || '');

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!profile) return <div className="py-12 text-center text-muted-foreground">Profile not found</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
