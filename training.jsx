import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "@/components/datasets/StatusBadge";
import TrainingMetrics from "@/components/training/TrainingMetrics";
import TrainDialog from "@/components/training/TrainDialog";

export default function Training() {
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [trainOpen, setTrainOpen] = useState(false);
  const qc = useQueryClient();

  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => base44.entities.Dataset.list("-created_date"),
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["allTrainingJobs"],
    queryFn: () => base44.entities.TrainingJob.list("-created_date"),
  });

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const verifiedDatasets = datasets.filter((d) => d.status === "verified");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Training</h1>
        <p className="text-sm text-slate-400 mt-1">Train models on verified datasets with integrity checks</p>
      </div>

      {/* Quick Train */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">Start Training</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
              <SelectTrigger className="sm:w-80">
                <SelectValue placeholder="Select a verified dataset..." />
              </SelectTrigger>
              <SelectContent>
                {verifiedDatasets.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name} — {ds.quality_percentage?.toFixed(0)}% quality
                  </SelectItem>
                ))}
                {verifiedDatasets.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-400">No verified datasets available</div>
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setTrainOpen(true)}
              disabled={!selectedDataset || selectedDataset.status !== "verified"}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Train Model
            </Button>
          </div>
          {selectedDataset && selectedDataset.status !== "verified" && (
            <div className="flex items-center gap-2 mt-3 text-sm text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              Only verified datasets can be used for AI training.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">Training History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">No training jobs yet</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-slate-700">{job.dataset_name || "Dataset"}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400 capitalize">{job.model_type}</span>
                        {job.training_duration_seconds && (
                          <span className="text-xs text-slate-400">{job.training_duration_seconds.toFixed(0)}s</span>
                        )}
                        <span className="text-xs text-slate-400">
                          {job.created_date ? format(new Date(job.created_date), "MMM d, h:mm a") : ""}
                        </span>
                      </div>
                    </div>
                    <StatusBadge
                      status={
                        job.status === "completed" ? "verified" : job.status === "failed" || job.status === "blocked" ? "rejected" : "pending"
                      }
                    />
                  </div>
                  <TrainingMetrics job={job} />
                  {job.error_message && (
                    <p className="text-xs text-red-500">{job.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDataset && (
        <TrainDialog
          open={trainOpen}
          onOpenChange={setTrainOpen}
          dataset={selectedDataset}
          onComplete={() => {
            qc.invalidateQueries({ queryKey: ["allTrainingJobs"] });
          }}
        />
      )}
    </div>
  );
}
