import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Download, ShieldCheck, Hash, Layers, Calendar, FileText, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import StatusBadge from "@/components/datasets/StatusBadge";
import QualityMeter from "@/components/datasets/QualityMeter";
import BlockchainBadge from "@/components/datasets/BlockchainBadge";
import TrainDialog from "@/components/training/TrainDialog";
import TrainingMetrics from "@/components/training/TrainingMetrics";

export default function DatasetDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const [trainOpen, setTrainOpen] = useState(false);
  const qc = useQueryClient();

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ["dataset", id],
    queryFn: () => base44.entities.Dataset.filter({ id }),
    enabled: !!id,
  });

  const dataset = datasets[0];

  const { data: jobs = [] } = useQuery({
    queryKey: ["datasetJobs", id],
    queryFn: () => base44.entities.TrainingJob.filter({ dataset_id: id }, "-created_date"),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Dataset not found</p>
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{dataset.name}</h1>
          {dataset.description && <p className="text-sm text-slate-400 mt-0.5">{dataset.description}</p>}
        </div>
        <StatusBadge status={dataset.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">Dataset Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <QualityMeter percentage={dataset.quality_percentage} size="lg" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem icon={Layers} label="Total Rows" value={dataset.total_rows?.toLocaleString()} />
              <InfoItem icon={ShieldCheck} label="Valid Rows" value={dataset.valid_rows?.toLocaleString()} />
              <InfoItem icon={HardDrive} label="File Size" value={dataset.file_size_bytes ? `${(dataset.file_size_bytes / 1024).toFixed(1)} KB` : "—"} />
              <InfoItem icon={Calendar} label="Uploaded" value={dataset.created_date ? format(new Date(dataset.created_date), "MMM d, yyyy") : "—"} />
              <InfoItem icon={FileText} label="Columns" value={dataset.columns?.length || 0} />
            </div>

            {dataset.columns?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Column Names</p>
                <div className="flex flex-wrap gap-1.5">
                  {dataset.columns.map((col) => (
                    <span key={col} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Panel */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-700">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">SHA-256 Hash</p>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <code className="text-xs text-slate-600 font-mono break-all bg-slate-50 rounded px-2 py-1">
                    {dataset.dataset_hash || "—"}
                  </code>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">Blockchain</p>
                <BlockchainBadge txHash={dataset.blockchain_tx_hash} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-700">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setTrainOpen(true)}
                disabled={dataset.status !== "verified"}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Train AI Model
              </Button>
              {dataset.status !== "verified" && (
                <p className="text-xs text-center text-slate-400">Only verified datasets can be used for training</p>
              )}
              {dataset.file_url && dataset.status === "verified" && (
                <a href={dataset.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full mt-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Dataset
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training History */}
      {jobs.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">Training History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-700 capitalize">{job.model_type}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {job.created_date ? format(new Date(job.created_date), "MMM d, h:mm a") : ""}
                    </span>
                  </div>
                  <StatusBadge status={job.status === "completed" ? "verified" : job.status === "failed" ? "rejected" : "pending"} />
                </div>
                <TrainingMetrics job={job} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <TrainDialog
        open={trainOpen}
        onOpenChange={setTrainOpen}
        dataset={dataset}
        onComplete={() => {
          qc.invalidateQueries({ queryKey: ["datasetJobs", id] });
        }}
      />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}
