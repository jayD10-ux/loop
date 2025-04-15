
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: "newest" | "oldest" | "a-z" | "z-a";
  onSortChange: (value: "newest" | "oldest" | "a-z" | "z-a") => void;
}

export function DashboardControls({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
}: DashboardControlsProps) {
  const getSortOrderLabel = () => {
    switch (sortOrder) {
      case "newest":
        return "Newest first";
      case "oldest":
        return "Oldest first";
      case "a-z":
        return "A to Z";
      case "z-a":
        return "Z to A";
      default:
        return "Sort";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search prototypes..."
          className="pl-8 h-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowUpDown className="h-4 w-4" />
            <span className="sr-only">{getSortOrderLabel()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => onSortChange("newest")}
            className={sortOrder === "newest" ? "bg-accent" : ""}
          >
            Newest first
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSortChange("oldest")}
            className={sortOrder === "oldest" ? "bg-accent" : ""}
          >
            Oldest first
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSortChange("a-z")}
            className={sortOrder === "a-z" ? "bg-accent" : ""}
          >
            A to Z
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSortChange("z-a")}
            className={sortOrder === "z-a" ? "bg-accent" : ""}
          >
            Z to A
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
