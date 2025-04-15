import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, CheckSquare, Trash } from "lucide-react";

interface TabNavigationProps {
  activeTab: "all" | "yours" | "team";
  onTabChange: (tab: "all" | "yours" | "team") => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
}

export function TabNavigation({ 
  activeTab, 
  onTabChange, 
  isSelectionMode, 
  onToggleSelectionMode,
  selectedCount
}: TabNavigationProps) {
  const handleTabChange = (value: string) => {
    onTabChange(value as "all" | "yours" | "team");
  };

  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">All Prototypes</TabsTrigger>
            <TabsTrigger value="yours">Your Prototypes</TabsTrigger>
            <TabsTrigger value="team">Team Prototypes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Button
        variant={isSelectionMode ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleSelectionMode}
        className="gap-2"
      >
        {isSelectionMode ? (
          <>
            <Check size={16} />
            Done{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </>
        ) : (
          <>
            <CheckSquare size={16} />
            Select
          </>
        )}
      </Button>
    </div>
  );
}
