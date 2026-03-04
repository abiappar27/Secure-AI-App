import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import AuditTimeline from "@/components/audit/AuditTimeline";

const EVENT_TYPES = [
  "all",
  "dataset_uploaded",
  "dataset_rejected",
  "dataset_verified",
  "tamper_detected",
  "training_started",
  "training_completed",
  "training_failed",
  "external_link_generated",
  "config_updated",
];

export default function AuditLog() {
  const [filter, setFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["allAuditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 100),
  });

  const filteredLogs = filter === "all" ? logs : logs.filter((l) => l.event_type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Log</h1>
          <p className="text-sm text-slate-400 mt-1">Complete security and activity history</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "all" ? "All Events" : t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <AuditTimeline logs={filteredLogs} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
