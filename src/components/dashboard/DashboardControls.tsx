
import { Search, SortDesc, SortAsc, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardControlsProps {
  teams: any[];
  activeTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  sortBy: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasTeams: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardControls({
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing
}: DashboardControlsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="relative w-48">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 h-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onSortChange(sortBy === 'newest' ? 'oldest' : 'newest')}
          >
            {sortBy === 'newest' ? (
              <SortDesc className="h-4 w-4" />
            ) : (
              <SortAsc className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {sortBy === 'newest' ? "Newest first" : "Oldest first"}
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Refresh
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
