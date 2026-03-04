import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "./StatusBadge";
import QualityMeter from "./QualityMeter";
import BlockchainBadge from "./BlockchainBadge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DatasetTable({ datasets, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!datasets?.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 rounded-full bg-slate-200" />
        </div>
        <p className="text-slate-500 text-sm">No datasets uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100 hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium">Name</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium">Status</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium">Quality</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium hidden md:table-cell">Rows</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium hidden lg:table-cell">Blockchain</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium hidden md:table-cell">Uploaded</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-slate-400 font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datasets.map((ds) => (
            <TableRow key={ds.id} className="border-slate-50 hover:bg-slate-25 group">
              <TableCell>
                <div>
                  <p className="font-medium text-slate-800">{ds.name}</p>
                  {ds.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ds.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell><StatusBadge status={ds.status} /></TableCell>
              <TableCell className="min-w-[140px]">
                <QualityMeter percentage={ds.quality_percentage} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-slate-600 font-mono">
                  {ds.valid_rows?.toLocaleString()} / {ds.total_rows?.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <BlockchainBadge txHash={ds.blockchain_tx_hash} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-slate-500">
                {ds.created_date ? format(new Date(ds.created_date), "MMM d, yyyy") : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Link to={createPageUrl("DatasetDetail") + `?id=${ds.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                      onClick={() => onDelete(ds.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
