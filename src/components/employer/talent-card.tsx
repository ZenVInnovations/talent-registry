'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { ScoreRing } from '@/components/ui/score-ring';
import { Avatar } from '@/components/ui/avatar';
import type { Profile } from '@/lib/api/profiles';

interface TalentCardProps {
  profile: Profile;
  matchScore?: number;
}

export function TalentCard({ profile, matchScore }: TalentCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={profile.anonymizedId || profile.displayName} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{profile.anonymizedId || profile.displayName}</h3>
            {profile.institutionName && (
              <p className="text-sm text-muted-foreground">{profile.institutionName}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {profile.domains.map((d) => <Tag key={d} variant="primary">{d}</Tag>)}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>{profile.projectCount} projects</span>
              <span>{profile.certificateCount} certificates</span>
            </div>
          </div>
          {matchScore !== undefined && <ScoreRing score={matchScore} size="sm" />}
        </div>
      </CardContent>
    </Card>
  );
}
