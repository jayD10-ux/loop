
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  activeTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  teams?: Team[];
}

export function TeamSelector({ teams = [], activeTeamId, onTeamChange }: TeamSelectorProps) {
  // Mock teams if none provided
  const displayTeams = teams.length ? teams : [
    { id: "team1", name: "Design Team" },
    { id: "team2", name: "Engineering" },
    { id: "team3", name: "Marketing" }
  ];
  
  const activeTeam = displayTeams.find(team => team.id === activeTeamId);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {activeTeam ? activeTeam.name : "Personal"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center justify-between"
            onClick={() => onTeamChange(null)}
          >
            Personal
            {activeTeamId === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          
          {displayTeams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="flex items-center justify-between"
              onClick={() => onTeamChange(team.id)}
            >
              {team.name}
              {activeTeamId === team.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
