import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabNavigationProps {
  activeTab: "all" | "yours" | "team";
  onTabChange: (tab: "all" | "yours" | "team") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const handleTabChange = (value: string) => {
    onTabChange(value as "all" | "yours" | "team");
  };

  return (
    <div className="">
      <div className="w-full">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">All Prototypes</TabsTrigger>
            <TabsTrigger value="yours">Your Prototypes</TabsTrigger>
            <TabsTrigger value="team">Team Prototypes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
