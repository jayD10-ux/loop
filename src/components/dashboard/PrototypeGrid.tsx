
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
    
    // Validate prototypes array
    if (!prototypes) {
      console.error("PrototypeGrid received null or undefined prototypes");
      setDisplayPrototypes([]);
      return;
    }
    
    // Ensure prototypes is an array and all items are valid
    if (Array.isArray(prototypes)) {
      // Filter out any invalid prototypes (undefined, null, or missing required fields)
      const validPrototypes = prototypes.filter(
        (p): p is Prototype => 
          !!p && 
          typeof p === 'object' && 
          typeof p.id === 'string' && 
          typeof p.name === 'string'
      );
      
      // Add logging for invalid prototypes
      if (validPrototypes.length < prototypes.length) {
        console.warn(
          `PrototypeGrid filtered out ${prototypes.length - validPrototypes.length} invalid prototypes`,
          prototypes.filter(p => !p || typeof p !== 'object' || typeof p.id !== 'string' || typeof p.name !== 'string')
        );
      }
      
      console.log("PrototypeGrid filtered prototypes:", validPrototypes);
      setDisplayPrototypes(validPrototypes);
    } else {
      console.error("PrototypeGrid received non-array prototypes:", prototypes);
      setDisplayPrototypes([]);
    }
  }, [activeTab, searchQuery, prototypes]);

  // Log for debugging
  console.log("PrototypeGrid displayPrototypes:", displayPrototypes);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPrototypes.map((prototype) => (
          prototype && prototype.id ? (
            <PrototypeCard key={prototype.id} prototype={prototype} />
          ) : null
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
