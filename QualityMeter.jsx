import { cn } from "@/lib/utils";

export default function QualityMeter({ percentage, size = "default" }) {
  const getColor = (pct) => {
    if (pct >= 90) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
    if (pct >= 75) return { bar: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" };
    if (pct >= 60) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" };
    return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };
  };

  const colors = getColor(percentage || 0);
  const isLarge = size === "lg";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className={cn("font-semibold", colors.text, isLarge ? "text-2xl" : "text-sm")}>
          {(percentage || 0).toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Quality</span>
      </div>
      <div className={cn("rounded-full overflow-hidden", colors.bg, isLarge ? "h-3" : "h-2")}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", colors.bar)}
          style={{ width: `${Math.min(percentage || 0, 100)}%` }}
        />
      </div>
      {percentage < 60 && (
        <p className="text-xs text-red-500 mt-1">Below 60% threshold — auto-rejected</p>
      )}
    </div>
  );
}
