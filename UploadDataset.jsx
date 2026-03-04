import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import QualityMeter from "./QualityMeter";
import { cn } from "@/lib/utils";

function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { columns: [], rows: [], totalRows: 0, validRows: 0 };
  const columns = lines[0].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const rows = [];
  const seen = new Set();
  let validRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cells.length !== columns.length) continue;
    rows.push(cells);
    const rowKey = cells.join("|");
    const hasEmpty = cells.some((c) => !c || c.toLowerCase() === "null" || c.toLowerCase() === "none" || c === "");
    const isDuplicate = seen.has(rowKey);
    if (!hasEmpty && !isDuplicate) {
      validRows++;
    }
    seen.add(rowKey);
  }

  return { columns, rows, totalRows: rows.length, validRows };
}

async function computeHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateFakeTxHash() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return "0x" + Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function UploadDialog({ open, onOpenChange, onUploadComplete }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("form");
  const [quality, setQuality] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const reset = () => {
    setName("");
    setDescription("");
    setFile(null);
    setStep("form");
    setQuality(null);
    setError("");
  };

  const handleClose = (val) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) return;
    setStep("validating");
    setError("");

    const text = await file.text();
    const { columns, rows, totalRows, validRows } = parseCSV(text);
    const qualityPct = totalRows > 0 ? (validRows / totalRows) * 100 : 0;
    setQuality(qualityPct);

    if (qualityPct < 60) {
      setStep("rejected");
      await base44.entities.AuditLog.create({
        event_type: "dataset_rejected",
        dataset_name: name,
        details: `Quality ${qualityPct.toFixed(1)}% below 60% threshold. ${totalRows} total rows, ${validRows} valid.`,
        severity: "warning",
      });
      return;
    }

    setStep("hashing");
    const hash = await computeHash(text);

    setStep("blockchain");
    const txHash = generateFakeTxHash();
    await new Promise((r) => setTimeout(r, 1200));

    setStep("saving");
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const dataset = await base44.entities.Dataset.create({
      name: name.trim(),
      description: description.trim(),
      file_url,
      total_rows: totalRows,
      valid_rows: validRows,
      quality_percentage: qualityPct,
      columns,
      dataset_hash: hash,
      blockchain_tx_hash: txHash,
      status: "verified",
      file_size_bytes: file.size,
    });

    await base44.entities.AuditLog.create({
      event_type: "dataset_verified",
      dataset_id: dataset.id,
      dataset_name: name,
      details: `Quality ${qualityPct.toFixed(1)}%, Hash: ${hash.slice(0, 12)}..., Tx: ${txHash.slice(0, 12)}...`,
      severity: "info",
    });

    setStep("done");
    setTimeout(() => {
      handleClose(false);
      onUploadComplete?.();
    }, 1500);
  };

  const steps = {
    form: null,
    validating: { label: "Validating dataset quality...", icon: Loader2, spin: true },
    rejected: null,
    hashing: { label: "Computing SHA-256 hash...", icon: Loader2, spin: true },
    blockchain: { label: "Registering on blockchain...", icon: Loader2, spin: true },
    saving: { label: "Saving dataset...", icon: Loader2, spin: true },
    done: { label: "Dataset verified & stored!", icon: CheckCircle, spin: false },
  };

  const currentStep = steps[step];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload Dataset</DialogTitle>
          <DialogDescription>Upload a CSV file for validation, hashing, and blockchain registration.</DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Dataset Name</Label>
              <Input placeholder="e.g. Customer Churn Data Q4" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                file ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to select CSV file</p>
                </>
              )}
            </div>
          </div>
        )}

        {step === "rejected" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-red-700 text-lg">Dataset Rejected</p>
              <p className="text-sm text-slate-500 mt-1">Quality below 60% threshold. Upload a cleaner dataset.</p>
            </div>
            {quality !== null && <QualityMeter percentage={quality} size="lg" />}
          </div>
        )}

        {currentStep && (
          <div className="py-8 text-center space-y-4">
            <currentStep.icon className={cn("w-10 h-10 mx-auto", currentStep.spin ? "text-slate-400 animate-spin" : "text-emerald-500")} />
            <p className="text-sm text-slate-600 font-medium">{currentStep.label}</p>
            {quality !== null && step !== "done" && <QualityMeter percentage={quality} />}
          </div>
        )}

        <DialogFooter>
          {step === "form" && (
            <Button onClick={handleUpload} disabled={!file || !name.trim()} className="w-full bg-slate-800 hover:bg-slate-900">
              <Upload className="w-4 h-4 mr-2" />
              Validate & Upload
            </Button>
          )}
          {step === "rejected" && (
            <Button variant="outline" onClick={() => { setStep("form"); setQuality(null); }} className="w-full">
              Try Another File
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
