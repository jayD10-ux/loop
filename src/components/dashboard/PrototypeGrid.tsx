
import { PrototypeCard } from "./PrototypeCard";
import { useState, useEffect } from "react";

// Mock data - would come from API in real app
const MOCK_PROTOTYPES = [
  {
    id: "1",
    title: "E-commerce Dashboard",
    description: "Redesigned e-commerce analytics dashboard with improved data visualization and user flow.",
    thumbnailUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=E-commerce+Dashboard",
    updatedAt: "2 days ago",
    commentCount: 8,
    tags: ["Dashboard", "Analytics"],
    source: "figma" as const,
  },
  {
    id: "2",
    title: "Mobile App Onboarding",
    description: "Simplified onboarding flow for our mobile application with progress indicators and helpful tips.",
    thumbnailUrl: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=Mobile+Onboarding",
    updatedAt: "4 days ago",
    commentCount: 12,
    tags: ["Mobile", "Onboarding"],
    source: "github" as const,
  },
  {
    id: "3", 
    title: "Product Detail Page",
    description: "Redesigned product page with improved image gallery, specs section, and related products.",
    thumbnailUrl: "https://placehold.co/600x400/6366F1/FFFFFF?text=Product+Detail",
    updatedAt: "1 week ago",
    commentCount: 5,
    tags: ["E-commerce", "Product"],
    source: "zip" as const,
  },
  {
    id: "4",
    title: "Checkout Flow Redesign",
    description: "Streamlined checkout process reducing steps from 5 to 3 while improving payment method selection.",
    thumbnailUrl: "https://placehold.co/600x400/EC4899/FFFFFF?text=Checkout+Flow",
    updatedAt: "2 weeks ago",
    commentCount: 9,
    tags: ["E-commerce", "Checkout"],
    source: "figma" as const,
  },
  {
    id: "5",
    title: "Admin Panel",
    description: "New version of the admin control panel with improved navigation and user management.",
    thumbnailUrl: "https://placehold.co/600x400/14B8A6/FFFFFF?text=Admin+Panel",
    updatedAt: "3 weeks ago",
    commentCount: 3,
    tags: ["Admin", "Dashboard"],
    source: "github" as const,
  },
  {
    id: "6",
    title: "Profile Settings UI",
    description: "Redesigned user profile and account settings page with better organization of options.",
    thumbnailUrl: "https://placehold.co/600x400/F59E0B/FFFFFF?text=Profile+Settings",
    updatedAt: "1 month ago",
    commentCount: 7,
    tags: ["Settings", "User Profile"],
    source: "zip" as const,
  },
];

const MOCK_SHARED_PROTOTYPES = [
  {
    id: "7",
    title: "Marketing Landing Page",
    description: "New campaign landing page with improved call-to-action placement and testimonial section.",
    thumbnailUrl: "https://placehold.co/600x400/4F46E5/FFFFFF?text=Landing+Page",
    updatedAt: "1 day ago",
    commentCount: 4,
    tags: ["Marketing", "Landing Page"],
    isShared: true,
    source: "figma" as const,
    sharedBy: { name: "Alex Johnson", avatarUrl: "https://i.pravatar.cc/150?img=11" },
  },
  {
    id: "8",
    title: "Notification Center",
    description: "Centralized notification system with filtering, read/unread states, and grouping options.",
    thumbnailUrl: "https://placehold.co/600x400/7C3AED/FFFFFF?text=Notifications",
    updatedAt: "3 days ago",
    commentCount: 6,
    tags: ["Notifications", "UI Component"],
    isShared: true,
    source: "github" as const,
    sharedBy: { name: "Sarah Miller", avatarUrl: "https://i.pravatar.cc/150?img=5" },
  },
];

const MOCK_COLLECTIONS = [
  {
    id: "c1",
    title: "Q1 Marketing Campaign",
    prototypes: [MOCK_PROTOTYPES[0], MOCK_PROTOTYPES[2], MOCK_SHARED_PROTOTYPES[0]],
  },
  {
    id: "c2",
    title: "Mobile App Redesign",
    prototypes: [MOCK_PROTOTYPES[1], MOCK_PROTOTYPES[5]],
  },
];

interface PrototypeGridProps {
  activeTab: string;
  searchQuery?: string;
}

export function PrototypeGrid({ activeTab, searchQuery = "" }: PrototypeGridProps) {
  const [prototypes, setPrototypes] = useState<any[]>([]);

  useEffect(() => {
    let filteredPrototypes: any[] = [];
    
    switch (activeTab) {
      case "all":
        filteredPrototypes = [...MOCK_PROTOTYPES];
        break;
      case "shared":
        filteredPrototypes = [...MOCK_SHARED_PROTOTYPES];
        break;
      case "collections":
        // For collections tab, we'll just show prototypes from the first collection
        // In a real app, we'd show a different UI for collections
        filteredPrototypes = MOCK_COLLECTIONS[0].prototypes;
        break;
      default:
        filteredPrototypes = [...MOCK_PROTOTYPES];
    }

    // Apply search filter if present
    if (searchQuery) {
      filteredPrototypes = filteredPrototypes.filter(
        prototype => 
          prototype.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prototype.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (prototype.tags && prototype.tags.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      );
    }

    setPrototypes(filteredPrototypes);
  }, [activeTab, searchQuery]);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prototypes.map((prototype) => (
          <PrototypeCard key={prototype.id} {...prototype} />
        ))}
      </div>
      {prototypes.length === 0 && (
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
