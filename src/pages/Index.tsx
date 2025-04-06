
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TabNavigation } from "@/components/dashboard/TabNavigation";
import { PrototypeGrid } from "@/components/dashboard/PrototypeGrid";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1">
        <TabNavigation onTabChange={setActiveTab} />
        
        <div className="container py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search prototypes..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <PrototypeGrid 
          activeTab={activeTab} 
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
};

export default Index;
