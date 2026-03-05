import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { outer: 'h-12 w-12', text: 'text-xs', stroke: 3, radius: 18 },
  md: { outer: 'h-16 w-16', text: 'text-sm', stroke: 3.5, radius: 24 },
  lg: { outer: 'h-20 w-20', text: 'text-base', stroke: 4, radius: 30 },
};

function getColor(score: number) {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

export function ScoreRing({ score, size = 'md', className }: ScoreRingProps) {
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', s.outer, className)}>
      <svg className="absolute -rotate-90" viewBox={`0 0 ${(s.radius + s.stroke) * 2} ${(s.radius + s.stroke) * 2}`}>
        <circle
          cx={s.radius + s.stroke}
          cy={s.radius + s.stroke}
          r={s.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          className="text-muted"
        />
        <circle
          cx={s.radius + s.stroke}
          cy={s.radius + s.stroke}
          r={s.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={getColor(score)}
        />
      </svg>
      <span className={cn('font-semibold', s.text, getColor(score))}>{Math.round(score)}%</span>
    </div>
  );
}
