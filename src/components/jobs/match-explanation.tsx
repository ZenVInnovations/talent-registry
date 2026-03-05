'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { MatchScore } from '@/lib/api/match';

interface MatchExplanationProps {
  match: MatchScore;
}

export function MatchExplanation({ match }: MatchExplanationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {match.dimensionScores.map((dim) => (
          <div key={dim.dimension}>
            <ProgressBar
              value={dim.score}
              label={dim.dimension}
              showValue
            />
            <p className="mt-0.5 text-xs text-muted-foreground">{dim.evidence}</p>
          </div>
        ))}
        {match.explanation && (
          <p className="text-sm text-muted-foreground border-t border-border pt-3">{match.explanation}</p>
        )}
      </CardContent>
    </Card>
  );
}
