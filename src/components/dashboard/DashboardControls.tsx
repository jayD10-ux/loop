
import { Search, SortDesc, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// TeamSelector import removed to disable team functionality

interface Team {
  id: string;
  name: string;
}

interface DashboardControlsProps {
  teams: Team[];
  activeTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  sortBy: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasTeams: boolean;
}

export function DashboardControls({
  teams,
  activeTeamId,
  onTeamChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  hasTeams,
}: DashboardControlsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        {/* Team selector removed to disable team functionality */}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSortChange(sortBy === 'newest' ? 'oldest' : 'newest')}
          title={sortBy === 'newest' ? "Newest first" : "Oldest first"}
        >
          {sortBy === 'newest' ? (
            <SortDesc className="h-4 w-4" />
          ) : (
            <SortAsc className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
