import { format } from "date-fns";
import { ShieldCheck, ShieldX, ShieldAlert, Upload, Play, CheckCircle, XCircle, Link2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const eventConfig = {
  dataset_uploaded: { icon: Upload, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  dataset_rejected: { icon: ShieldX, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  dataset_verified: { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  tamper_detected: { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  training_started: { icon: Play, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200" },
  training_completed: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  training_failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  external_link_generated: { icon: Link2, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
  config_updated: { icon: Settings, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

export default function AuditTimeline({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-48 bg-slate-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        No audit events recorded yet
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-100" />
      <div className="space-y-1">
        {logs.map((log) => {
          const config = eventConfig[log.event_type] || eventConfig.config_updated;
          const Icon = config.icon;
          return (
            <div key={log.id} className="relative flex gap-4 p-3 rounded-xl hover:bg-slate-25 transition-colors group">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", config.bg, config.border)}>
                <Icon className={cn("w-4.5 h-4.5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    {log.event_type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0">
                    {log.created_date ? format(new Date(log.created_date), "MMM d, h:mm a") : ""}
                  </span>
                </div>
                {log.dataset_name && (
                  <p className="text-xs text-slate-500 mt-0.5">Dataset: {log.dataset_name}</p>
                )}
                {log.details && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{log.details}</p>
                )}
                {log.severity === "critical" && (
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    Critical
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
