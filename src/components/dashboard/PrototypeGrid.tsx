import { PrototypeCard } from "./PrototypeCard";
import { useState, useEffect } from "react";
import { Prototype } from "@/types/prototype";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";

interface PrototypeGridProps {
  activeTab: string;
  searchQuery?: string;
  prototypes: Prototype[];
  isSelectionMode?: boolean;
  onDeletePrototypes?: (ids: string[]) => void;
}

export function PrototypeGrid({ 
  activeTab, 
  searchQuery = "", 
  prototypes = [],
  isSelectionMode = false,
  onDeletePrototypes
}: PrototypeGridProps) {
  const [displayPrototypes, setDisplayPrototypes] = useState<Prototype[]>([]);
  const [selectedPrototypes, setSelectedPrototypes] = useState<string[]>([]);

  // Reset selection when selection mode is toggled
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedPrototypes([]);
    }
  }, [isSelectionMode]);

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

  // Function to distribute prototypes into columns for masonry effect
  const getGridColumns = () => {
    if (displayPrototypes.length === 0) return null;
    
    // Create columns for masonry layout
    const columns = [[], [], []];
    
    displayPrototypes.forEach((prototype, index) => {
      // Distribute items across columns
      columns[index % columns.length].push(prototype);
    });
    
    return columns;
  };

  const handleSelect = (id: string) => {
    setSelectedPrototypes(prev => {
      if (prev.includes(id)) {
        return prev.filter(prototypeId => prototypeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPrototypes.length === displayPrototypes.length) {
      setSelectedPrototypes([]);
    } else {
      setSelectedPrototypes(displayPrototypes.map(p => p.id));
    }
  };

  const handleDelete = () => {
    if (onDeletePrototypes && selectedPrototypes.length > 0) {
      onDeletePrototypes(selectedPrototypes);
      setSelectedPrototypes([]);
    }
  };

  const columns = getGridColumns();

  return (
    <div className="w-full py-6">
      {isSelectionMode && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedPrototypes.length === displayPrototypes.length 
                ? "Deselect All" 
                : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedPrototypes.length} selected
            </span>
          </div>

          {selectedPrototypes.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash size={16} className="mr-2" />
                  Delete {selectedPrototypes.length > 1 ? "Selected" : ""}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete 
                    {selectedPrototypes.length === 1 
                      ? " the selected prototype." 
                      : ` ${selectedPrototypes.length} selected prototypes.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {columns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-6">
              {column.map((prototype) => (
                isSelectionMode ? (
                  <PrototypeCard 
                    key={prototype.id} 
                    prototype={prototype}
                    isSelectable={true}
                    isSelected={selectedPrototypes.includes(prototype.id)}
                    onSelect={handleSelect}
                  />
                ) : (
                  <Link key={prototype.id} to={`/prototype/${prototype.id}`}>
                    <PrototypeCard 
                      prototype={prototype} 
                    />
                  </Link>
                )
              ))}
            </div>
          ))}
        </div>
      ) : (
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
