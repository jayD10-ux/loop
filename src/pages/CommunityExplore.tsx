import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Prototype } from "@/types/prototype";

// Mock data for community prototypes - would come from API in production
const MOCK_COMMUNITY_PROTOTYPES = [
  {
    id: "c1",
    name: "Task Management Dashboard",
    description: "A sleek task management UI with drag-and-drop functionality and progress tracking.",
    thumbnailUrl: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Task+Dashboard",
    created_at: "2025-04-12T08:30:00",
    updated_at: "2025-04-12T08:30:00",
    created_by: "u1",
    tech_stack: "html",
    files: {},
    viewCount: 238,
    commentCount: 15,
    tags: ["Dashboard", "UI/UX", "React"],
    creator: {
      id: "u1",
      name: "Alex Chen",
      avatarUrl: "https://i.pravatar.cc/150?img=12"
    }
  },
  {
    id: "c2",
    name: "E-commerce Product Page",
    description: "Modern product showcase with image gallery, reviews section, and add-to-cart animations.",
    thumbnailUrl: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=Product+Page",
    created_at: "2025-04-10T11:45:00",
    updated_at: "2025-04-10T11:45:00",
    created_by: "u2",
    tech_stack: "react",
    files: {},
    viewCount: 176,
    commentCount: 8,
    tags: ["E-commerce", "Animation", "Tailwind"],
    creator: {
      id: "u2",
      name: "Sarah Miller",
      avatarUrl: "https://i.pravatar.cc/150?img=5"
    }
  },
  {
    id: "c3",
    name: "Multi-step Form Wizard",
    description: "Progressive form with validation, conditional logic, and animated transitions between steps.",
    thumbnailUrl: "https://placehold.co/600x400/EC4899/FFFFFF?text=Form+Wizard",
    created_at: "2025-04-08T14:20:00",
    updated_at: "2025-04-08T14:20:00",
    created_by: "u3",
    tech_stack: "vue",
    files: {},
    viewCount: 321,
    commentCount: 22,
    tags: ["Form", "Animation", "Validation"],
    creator: {
      id: "u3",
      name: "Miguel Santos",
      avatarUrl: "https://i.pravatar.cc/150?img=3"
    }
  },
  {
    id: "c4",
    name: "Dark Mode Navigation",
    description: "Responsive navigation bar with smooth dark mode toggle and dropdown menu animations.",
    thumbnailUrl: "https://placehold.co/600x400/10B981/FFFFFF?text=Dark+Nav",
    created_at: "2025-04-05T09:15:00",
    updated_at: "2025-04-05T09:15:00",
    created_by: "u4",
    tech_stack: "react",
    files: {},
    viewCount: 412,
    commentCount: 17,
    tags: ["Navigation", "Dark Mode", "Responsive"],
    creator: {
      id: "u4",
      name: "Jade Wilson",
      avatarUrl: "https://i.pravatar.cc/150?img=8"
    }
  },
  {
    id: "c5",
    name: "Interactive Data Visualization",
    description: "Dynamic charts and graphs with filtering options and tooltips for detailed information.",
    thumbnailUrl: "https://placehold.co/600x400/F59E0B/FFFFFF?text=Data+Viz",
    created_at: "2025-04-01T16:40:00",
    updated_at: "2025-04-01T16:40:00",
    created_by: "u5",
    tech_stack: "svelte",
    files: {},
    viewCount: 287,
    commentCount: 12,
    tags: ["Data Viz", "Charts", "Interactive"],
    creator: {
      id: "u5",
      name: "Emma Patel",
      avatarUrl: "https://i.pravatar.cc/150?img=15"
    }
  },
  {
    id: "c6",
    name: "Audio Player Interface",
    description: "Modern audio player with waveform visualization, playlists, and customizable themes.",
    thumbnailUrl: "https://placehold.co/600x400/6366F1/FFFFFF?text=Audio+Player",
    created_at: "2025-03-28T10:30:00",
    updated_at: "2025-03-28T10:30:00",
    created_by: "u6",
    tech_stack: "react",
    files: {},
    viewCount: 198,
    commentCount: 9,
    tags: ["Audio", "Media", "UI Component"],
    creator: {
      id: "u6",
      name: "Liam Johnson",
      avatarUrl: "https://i.pravatar.cc/150?img=7"
    }
  }
];

interface CommunityPrototype extends Prototype {
  viewCount: number;
  commentCount: number;
  thumbnailUrl: string;
  tags: string[];
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export function CommunityExplore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [prototypes, setPrototypes] = useState<CommunityPrototype[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from Supabase
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPrototypes(MOCK_COMMUNITY_PROTOTYPES as CommunityPrototype[]);
      
      // Extract all unique tags
      const allTags = MOCK_COMMUNITY_PROTOTYPES.flatMap(p => p.tags);
      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);
      
      setLoading(false);
    }, 800);
  }, []);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const handlePrototypeClick = (id: string) => {
    navigate(`/community/prototype/${id}`);
  };

  // Filter and sort prototypes
  const filteredPrototypes = prototypes
    .filter(prototype => {
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        prototype.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prototype.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => prototype.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      // Sort based on selected option
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "trending":
          return b.viewCount - a.viewCount;
        case "most-commented":
          return b.commentCount - a.commentCount;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-8 border-b">
          <div className="container">
            <h1 className="text-3xl font-bold mb-2">Community Showcase</h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore innovative prototypes from Loop creators. Get inspired, leave feedback, and learn from the community.
            </p>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="border-b py-4 bg-background">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/3">
                <Input
                  placeholder="Search prototypes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap justify-center md:justify-end items-center w-full md:w-2/3">
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="most-commented">Most Commented</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/community/submit')}
                  className="whitespace-nowrap"
                >
                  Submit Prototype
                </Button>
              </div>
            </div>
            
            {/* Tags Filter */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${selectedTags.includes(tag) ? 'bg-primary' : ''}`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Prototypes Grid */}
        <div className="container py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6 mb-4" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-muted/30 flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredPrototypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrototypes.map(prototype => (
                    <Card 
                      key={prototype.id} 
                      className="overflow-hidden transition-all hover:shadow-md cursor-pointer group"
                      onClick={() => handlePrototypeClick(prototype.id)}
                    >
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img 
                          src={prototype.thumbnailUrl} 
                          alt={prototype.name}
                          className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <Badge variant="secondary" className="bg-black/60 text-white border-none">
                            <Eye className="h-3 w-3 mr-1" />
                            {prototype.viewCount}
                          </Badge>
                          <Badge variant="secondary" className="bg-black/60 text-white border-none">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {prototype.commentCount}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{prototype.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
                          {prototype.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2 mb-3">
                          {prototype.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prototype.creator.avatarUrl} alt={prototype.creator.name} />
                            <AvatarFallback>{prototype.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{prototype.creator.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="text-xl font-semibold mb-2">No prototypes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedTags.length > 0
                      ? "No prototypes match your search criteria."
                      : "No community prototypes available yet."}
                  </p>
                  {(searchQuery || selectedTags.length > 0) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTags([]);
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CommunityExplore;
