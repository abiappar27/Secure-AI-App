import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus } from "lucide-react";
import StatsOverview from "@/components/dashboard/StatsOverview";
import DatasetTable from "@/components/datasets/DatasetTable";
import AuditTimeline from "@/components/audit/AuditTimeline";
import UploadDialog from "@/components/datasets/UploadDialog";

export default function Dashboard() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const qc = useQueryClient();

  const { data: datasets = [], isLoading: datasetsLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => base44.entities.Dataset.list("-created_date"),
  });

  const { data: trainingJobs = [] } = useQuery({
    queryKey: ["trainingJobs"],
    queryFn: () => base44.entities.TrainingJob.list("-created_date"),
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 20),
  });

  const handleDelete = async (id) => {
    await base44.entities.Dataset.delete(id);
    qc.invalidateQueries({ queryKey: ["datasets"] });
  };

  const handleUploadComplete = () => {
    qc.invalidateQueries({ queryKey: ["datasets"] });
    qc.invalidateQueries({ queryKey: ["auditLogs"] });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dataset Management</h1>
          <p className="text-sm text-slate-400 mt-1">Secure AI datasets with blockchain verification</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-slate-800 hover:bg-slate-900 shadow-sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload Dataset
        </Button>
      </div>

      <StatsOverview datasets={datasets} trainingJobs={trainingJobs} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            <DatasetTable datasets={datasets} onDelete={handleDelete} isLoading={datasetsLoading} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditTimeline logs={auditLogs} isLoading={logsLoading} />
          </CardContent>
        </Card>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploadComplete={handleUploadComplete} />
    </div>
  );
}
