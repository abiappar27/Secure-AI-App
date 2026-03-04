import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Trash2, ShieldAlert, Link2, Globe } from "lucide-react";
import StatusBadge from "@/components/datasets/StatusBadge";

export default function ExternalTraining() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ platform_name: "", platform_url: "", platform_type: "custom" });

  const { data: configs = [] } = useQuery({
    queryKey: ["externalConfigs"],
    queryFn: () => base44.entities.ExternalTrainingConfig.list("-created_date"),
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => base44.entities.Dataset.list("-created_date"),
  });

  const verifiedDatasets = datasets.filter((d) => d.status === "verified");

  const handleAdd = async () => {
    if (!form.platform_name || !form.platform_url) return;
    await base44.entities.ExternalTrainingConfig.create({ ...form, is_active: true });
    await base44.entities.AuditLog.create({
      event_type: "config_updated",
      details: `Added external training platform: ${form.platform_name} (${form.platform_url})`,
      severity: "info",
    });
    qc.invalidateQueries({ queryKey: ["externalConfigs"] });
    setAddOpen(false);
    setForm({ platform_name: "", platform_url: "", platform_type: "custom" });
  };

  const handleDelete = async (id) => {
    await base44.entities.ExternalTrainingConfig.delete(id);
    qc.invalidateQueries({ queryKey: ["externalConfigs"] });
  };

  const handleRedirect = async (config, dataset) => {
    if (dataset.status !== "verified") return;
    await base44.entities.AuditLog.create({
      event_type: "external_link_generated",
      dataset_id: dataset.id,
      dataset_name: dataset.name,
      details: `Redirected to ${config.platform_name}: ${config.platform_url}`,
      severity: "info",
    });
    const url = new URL(config.platform_url);
    if (dataset.file_url) {
      url.searchParams.set("dataset_url", dataset.file_url);
    }
    window.open(url.toString(), "_blank");
  };

  const platformIcons = {
    huggingface: "🤗",
    colab: "📓",
    sagemaker: "☁️",
    custom: "🔗",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">External Training</h1>
          <p className="text-sm text-slate-400 mt-1">Connect verified datasets to external AI training platforms</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-slate-800 hover:bg-slate-900">
          <Plus className="w-4 h-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {/* Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configs.map((config) => (
          <Card key={config.id} className="border-0 shadow-sm group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{platformIcons[config.platform_type] || "🔗"}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{config.platform_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{config.platform_type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(config.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                <Globe className="w-3 h-3" />
                <span className="truncate">{config.platform_url}</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Send Dataset</p>
                {verifiedDatasets.length === 0 ? (
                  <p className="text-xs text-slate-400">No verified datasets available</p>
                ) : (
                  verifiedDatasets.slice(0, 3).map((ds) => (
                    <button
                      key={ds.id}
                      onClick={() => handleRedirect(config, ds)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-sm text-slate-600 truncate">{ds.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {configs.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">No external platforms configured</p>
            <p className="text-xs text-slate-400 mt-1">Add HuggingFace, Colab, SageMaker, or custom platforms</p>
          </div>
        )}
      </div>

      {/* Non-verified warning */}
      {datasets.some((d) => d.status !== "verified") && (
        <Card className="border-amber-200 bg-amber-50 border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              Only verified datasets can be sent to external training platforms. Datasets that are rejected or compromised are blocked.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Platform Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Training Platform</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input placeholder="e.g. HuggingFace" value={form.platform_name} onChange={(e) => setForm({ ...form, platform_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Platform URL</Label>
              <Input placeholder="https://huggingface.co/..." value={form.platform_url} onChange={(e) => setForm({ ...form, platform_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Platform Type</Label>
              <Select value={form.platform_type} onValueChange={(v) => setForm({ ...form, platform_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="huggingface">HuggingFace</SelectItem>
                  <SelectItem value="colab">Google Colab</SelectItem>
                  <SelectItem value="sagemaker">AWS SageMaker</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={!form.platform_name || !form.platform_url} className="w-full bg-slate-800 hover:bg-slate-900">
              Add Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
