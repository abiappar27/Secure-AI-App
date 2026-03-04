import { Card, CardContent } from "@/components/ui/card";
import { Database, ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { key: "total", label: "Total Datasets", icon: Database, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  { key: "verified", label: "Verified", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { key: "compromised", label: "Compromised", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { key: "trainings", label: "Training Jobs", icon: Activity, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
];

export default function StatsOverview({ datasets, trainingJobs }) {
  const counts = {
    total: datasets?.length || 0,
    verified: datasets?.filter((d) => d.status === "verified").length || 0,
    compromised: datasets?.filter((d) => d.status === "compromised").length || 0,
    trainings: trainingJobs?.length || 0,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.key} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", s.bg, s.border)}>
                  <Icon className={cn("w-5 h-5", s.color)} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800 tabular-nums">{counts[s.key]}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
