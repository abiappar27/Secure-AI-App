import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MetricCard({ label, value, color }) {
  const pct = ((value || 0) * 100).toFixed(1);
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-3xl font-bold tabular-nums", color)}>{pct}</span>
          <span className="text-sm text-slate-400">%</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", color.replace("text-", "bg-"))}
            style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrainingMetrics({ job }) {
  if (!job || job.status !== "completed") return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard label="Accuracy" value={job.accuracy} color="text-emerald-600" />
      <MetricCard label="Precision" value={job.precision} color="text-blue-600" />
      <MetricCard label="Recall" value={job.recall} color="text-violet-600" />
    </div>
  );
}
