
import { PrototypeCard } from "./PrototypeCard";
import { useState, useEffect } from "react";
import { Prototype } from "@/types/prototype";

interface PrototypeGridProps {
  activeTab: string;
  searchQuery?: string;
  prototypes: Prototype[]; 
}

export function PrototypeGrid({ activeTab, searchQuery = "", prototypes = [] }: PrototypeGridProps) {
  const [displayPrototypes, setDisplayPrototypes] = useState<Prototype[]>([]);

  useEffect(() => {
    // Enhanced logging for debugging
    console.log("PrototypeGrid received prototypes:", prototypes);
    
    // Handle null/undefined prototypes array
    if (!prototypes || !Array.isArray(prototypes)) {
      console.error("PrototypeGrid received null or undefined prototypes");
      setDisplayPrototypes([]);
      return;
    }
    
    // Deep validation of each prototype
    const validPrototypes = prototypes.filter((p): p is Prototype => {
      if (!p) {
        console.warn("Filtered out null/undefined prototype");
        return false;
      }
      
      if (typeof p !== 'object') {
        console.warn("Filtered out non-object prototype:", p);
        return false;
      }
      
      // Check for required fields
      const isValid = 'id' in p && typeof p.id === 'string' && 
                     'name' in p && typeof p.name === 'string';
      
      if (!isValid) {
        console.warn("Filtered out invalid prototype missing required fields:", p);
      }
      
      return isValid;
    });
    
    // Add logging for debugging
    if (validPrototypes.length < prototypes.length) {
      console.warn(`Filtered out ${prototypes.length - validPrototypes.length} invalid prototypes`);
    }
    
    setDisplayPrototypes(validPrototypes);
  }, [activeTab, searchQuery, prototypes]);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPrototypes.map((prototype) => (
          <PrototypeCard key={prototype.id} prototype={prototype} />
        ))}
      </div>
      {displayPrototypes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="text-xl font-semibold mb-2">No prototypes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No prototypes match your search criteria." 
              : activeTab === "shared" 
                ? "No prototypes have been shared with you yet." 
                : "You haven't added any prototypes yet."}
          </p>
        </div>
      )}
    </div>
  );
}
