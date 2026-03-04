import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  rejected: {
    label: "Rejected",
    icon: ShieldX,
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  },
  compromised: {
    label: "Compromised",
    icon: ShieldAlert,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
  },
};

export default function StatusBadge({ status, size = "default" }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium gap-1.5 transition-colors",
        config.className,
        size === "lg" && "text-sm px-3 py-1.5"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", size === "lg" && "w-4 h-4")} />
      {config.label}
    </Badge>
  );
}
