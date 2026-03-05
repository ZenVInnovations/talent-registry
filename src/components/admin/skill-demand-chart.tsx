import { cn } from '@/lib/utils';

interface SkillDemandChartProps {
  skills: { skill: string; demand: number; supply: number }[];
  className?: string;
}

export function SkillDemandChart({ skills, className }: SkillDemandChartProps) {
  const maxVal = Math.max(...skills.flatMap((s) => [s.demand, s.supply]), 1);
  return (
    <div className={cn('space-y-4', className)}>
      {skills.slice(0, 10).map((s) => (
        <div key={s.skill} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{s.skill}</span>
            <span className="text-xs text-muted-foreground">Demand: {s.demand} | Supply: {s.supply}</span>
          </div>
          <div className="flex gap-1">
            <div className="h-3 rounded bg-primary transition-all" style={{ width: `${(s.demand / maxVal) * 100}%` }} title={`Demand: ${s.demand}`} />
            <div className="h-3 rounded bg-success/60 transition-all" style={{ width: `${(s.supply / maxVal) * 100}%` }} title={`Supply: ${s.supply}`} />
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary" /> Demand</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-success/60" /> Supply</span>
      </div>
    </div>
  );
}
