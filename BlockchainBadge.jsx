import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function BlockchainBadge({ txHash, className }) {
  if (!txHash) return null;

  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 gap-1.5 cursor-pointer font-mono text-xs transition-colors",
              className
            )}
          >
            <Link2 className="w-3 h-3" />
            {shortHash}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{txHash}</p>
          <p className="text-xs text-slate-400 mt-1">Blockchain Transaction Hash</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
