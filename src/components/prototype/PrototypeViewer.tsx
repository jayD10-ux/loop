
import { useState, useEffect, useRef } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Download, 
  Code, 
  MessageSquare, 
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink, 
  Plus,
  Share2,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackMarker } from "./FeedbackMarker";
import { CommentThread } from "./CommentThread";
import * as animeJs from "animejs";
const anime = animeJs.default;
import { useNavigate } from "react-router-dom";

interface PrototypeViewerProps {
  id: string;
}

export function PrototypeViewer({ id }: PrototypeViewerProps) {
  const navigate = useNavigate();
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [controlsVisible, setControlsVisible] = useState(true);
  
  // Refs for animation targets
  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const commentThreadRef = useRef<HTMLDivElement>(null);
  const feedbackButtonRef = useRef<HTMLButtonElement>(null);
  
  // Mock data - would be fetched from API in real app
  const prototype = {
    id,
    title: "E-commerce Dashboard Redesign",
    description: "A complete redesign of the analytics dashboard for our e-commerce platform.",
    previewUrl: "https://placehold.co/1200x900/3B82F6/FFFFFF?text=Interactive+Prototype",
    figmaUrl: "https://figma.com/example",
    codeUrl: "https://github.com/example/repo",
    createdBy: {
      name: "John Smith",
      avatarUrl: "https://i.pravatar.cc/150?img=3"
    },
    updatedAt: "2 days ago",
    comments: [
      {
        id: "c1",
        x: 25,
        y: 30,
        author: {
          name: "Maria Rodriguez",
          avatarUrl: "https://i.pravatar.cc/150?img=6"
        },
        content: "The chart colors might be difficult for colorblind users. Can we adjust the palette?",
        createdAt: "1 day ago",
        replies: [
          {
            id: "r1",
            author: {
              name: "John Smith",
              avatarUrl: "https://i.pravatar.cc/150?img=3"
            },
            content: "Good point! I'll update the colors to be more accessible.",
            createdAt: "1 day ago"
          }
        ]
      },
      {
        id: "c2",
        x: 70,
        y: 55,
        author: {
          name: "Alex Johnson",
          avatarUrl: "https://i.pravatar.cc/150?img=11"
        },
        content: "The filters dropdown menu is showing too many options. Can we group them?",
        createdAt: "2 days ago",
        replies: []
      }
    ]
  };

  const handleDeviceChange = (device: string) => {
    setActiveDevice(device);
    
    // Animate device change
    anime({
      targets: previewRef.current,
      width: device === "desktop" ? "100%" : 
             device === "tablet" ? "768px" : "375px",
      easing: "easeInOutQuad",
      duration: 300
    });
  };

  const toggleFeedbackMode = () => {
    setFeedbackMode(!feedbackMode);
    // Clear selected comment when toggling mode
    setSelectedCommentId(null);
    
    // Animate feedback button
    anime({
      targets: feedbackButtonRef.current,
      scale: [1, 1.1, 1],
      duration: 400,
      easing: "easeInOutQuad"
    });
    
    // Animate feedback markers appearing/disappearing
    if (!feedbackMode) {
      anime({
        targets: ".feedback-marker",
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: "spring(1, 80, 10, 0)",
        duration: 600
      });
      
      // Animate add feedback button
      anime({
        targets: ".add-feedback-btn",
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: "easeOutQuad"
      });
    } else {
      anime({
        targets: ".feedback-marker",
        scale: [1, 0],
        opacity: [1, 0],
        delay: anime.stagger(50),
        easing: "easeOutQuad",
        duration: 300
      });
      
      anime({
        targets: ".add-feedback-btn",
        translateY: [0, 20],
        opacity: [1, 0],
        duration: 300,
        easing: "easeOutQuad"
      });
    }
  };

  const handleCommentSelect = (commentId: string) => {
    const newSelectedId = commentId === selectedCommentId ? null : commentId;
    setSelectedCommentId(newSelectedId);
    
    if (newSelectedId) {
      // Animate comment thread appearing
      setTimeout(() => {
        anime({
          targets: commentThreadRef.current,
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 400,
          easing: "easeOutQuad"
        });
      }, 0);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Animate tab content change
    anime({
      targets: `[data-tab-content="${value}"]`,
      translateX: [10, 0],
      opacity: [0, 1],
      duration: 300,
      easing: "easeOutQuad"
    });
  };

  const toggleControlsVisibility = () => {
    setControlsVisible(!controlsVisible);
    
    // Animate controls bar appearing/disappearing
    anime({
      targets: controlsRef.current,
      translateY: controlsVisible ? [0, -100] : [-100, 0],
      opacity: controlsVisible ? [1, 0] : [0, 1],
      duration: 400,
      easing: "easeInOutQuad",
    });
  };

  const refreshPreview = () => {
    // Animate refresh button
    anime({
      targets: ".refresh-button",
      rotate: 360,
      duration: 600,
      easing: "easeInOutQuad",
    });
    
    // Simulate iframe refresh with visual feedback
    anime({
      targets: previewRef.current,
      opacity: [1, 0.7, 1],
      duration: 600,
      easing: "easeInOutQuad",
    });
  };

  const handleBack = () => {
    // Animate exit before navigating back
    anime({
      targets: document.querySelector('.container'),
      opacity: [1, 0],
      translateY: [0, 10],
      duration: 300,
      easing: "easeOutQuad",
      complete: () => {
        navigate('/');
      }
    });
  };
  
  // Initial animation on component mount
  useEffect(() => {
    anime({
      targets: headerRef.current,
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 600,
      easing: "easeOutQuad"
    });
    
    anime({
      targets: previewRef.current,
      translateY: [20, 0],
      opacity: [0, 1],
      delay: 200,
      duration: 600,
      easing: "easeOutQuad"
    });

    // Set up hover detection near top of screen to show controls if hidden
    const handleMouseNearTop = (e: MouseEvent) => {
      if (!controlsVisible && e.clientY < 20) {
        setControlsVisible(true);
        anime({
          targets: controlsRef.current,
          translateY: [-100, 0],
          opacity: [0, 1],
          duration: 400,
          easing: "easeOutQuad",
        });
      }
    };

    document.addEventListener('mousemove', handleMouseNearTop);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseNearTop);
    };
  }, [controlsVisible]);

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        ref={controlsRef}
        className="w-full bg-background border-b border-border transition-all duration-300"
        style={{ 
          opacity: controlsVisible ? 1 : 0,
          transform: `translateY(${controlsVisible ? 0 : '-100px'})`,
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div className="container py-4">
          <div className="flex justify-between items-center" ref={headerRef}>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleBack}
                className="transition-transform hover:scale-110"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-xl font-bold">{prototype.title}</h1>
                <p className="text-sm text-muted-foreground">{prototype.description}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container pb-3">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <div className="bg-background border rounded-md p-1 flex items-center">
                <Button
                  variant={activeDevice === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2 transition-colors"
                  onClick={() => handleDeviceChange("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeDevice === "tablet" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2 transition-colors"
                  onClick={() => handleDeviceChange("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeDevice === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2 transition-colors"
                  onClick={() => handleDeviceChange("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                ref={feedbackButtonRef}
                variant={feedbackMode ? "secondary" : "outline"}
                size="sm"
                onClick={toggleFeedbackMode}
                className="transition-transform hover:scale-105"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={refreshPreview}
                className="transition-transform hover:scale-105 refresh-button"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="transition-transform hover:scale-105"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleControlsVisibility}
                className="transition-transform hover:scale-105"
              >
                {controlsVisible ? 
                  <EyeOff className="h-4 w-4" /> : 
                  <Eye className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-1 bg-muted/20">
        <div className="container py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="hidden">
            <TabsContent value="preview" className="mt-0" data-tab-content="preview">
              <div 
                ref={previewRef}
                className={`relative border rounded-lg overflow-hidden bg-gray-100 mx-auto ${
                  activeDevice === "desktop" ? "w-full" : 
                  activeDevice === "tablet" ? "w-[768px]" : 
                  "w-[375px]"
                }`}
              >
                <div className="relative">
                  <img 
                    src={prototype.previewUrl} 
                    alt={prototype.title}
                    className="w-full"
                  />
                  
                  {feedbackMode && (
                    <>
                      {prototype.comments.map((comment) => (
                        <FeedbackMarker
                          key={comment.id}
                          id={comment.id}
                          x={comment.x}
                          y={comment.y}
                          count={comment.replies.length + 1}
                          isSelected={selectedCommentId === comment.id}
                          onClick={() => handleCommentSelect(comment.id)}
                        />
                      ))}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-4 right-4 add-feedback-btn"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feedback
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="mt-0" data-tab-content="code">
              <div className="border rounded-lg overflow-hidden bg-gray-100 p-6">
                <div className="bg-loop-gray-800 text-white p-4 rounded-md overflow-auto max-h-[600px]">
                  <pre className="text-sm">
                    <code>{`// This is a code preview example
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardChart = ({ data }) => {
  return (
    <div className="dashboard-chart">
      <h3 className="chart-title">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};`}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-0" data-tab-content="design">
              <div className="border rounded-lg overflow-hidden bg-gray-100 p-6">
                <div className="flex flex-col items-center justify-center p-10">
                  <ExternalLink className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Figma Design</h3>
                  <p className="text-muted-foreground mb-4 text-center">View the original design in Figma</p>
                  <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Figma
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Visible tab content */}
          <div>
            {activeTab === "preview" && (
              <div 
                ref={previewRef}
                className={`relative border rounded-lg overflow-hidden bg-gray-100 mx-auto ${
                  activeDevice === "desktop" ? "w-full" : 
                  activeDevice === "tablet" ? "w-[768px]" : 
                  "w-[375px]"
                }`}
                style={{ 
                  minHeight: "70vh", 
                  transition: "width 0.3s ease" 
                }}
              >
                <div className="relative">
                  <img 
                    src={prototype.previewUrl} 
                    alt={prototype.title}
                    className="w-full"
                  />
                  
                  {feedbackMode && (
                    <>
                      {prototype.comments.map((comment) => (
                        <FeedbackMarker
                          key={comment.id}
                          id={comment.id}
                          x={comment.x}
                          y={comment.y}
                          count={comment.replies.length + 1}
                          isSelected={selectedCommentId === comment.id}
                          onClick={() => handleCommentSelect(comment.id)}
                        />
                      ))}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-4 right-4 add-feedback-btn"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feedback
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "code" && (
              <div className="border rounded-lg overflow-hidden bg-gray-100 p-6">
                <div className="bg-loop-gray-800 text-white p-4 rounded-md overflow-auto max-h-[600px]">
                  <pre className="text-sm">
                    <code>{`// This is a code preview example
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardChart = ({ data }) => {
  return (
    <div className="dashboard-chart">
      <h3 className="chart-title">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};`}</code>
                  </pre>
                </div>
              </div>
            )}
            
            {activeTab === "design" && (
              <div className="border rounded-lg overflow-hidden bg-gray-100 p-6">
                <div className="flex flex-col items-center justify-center p-10">
                  <ExternalLink className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Figma Design</h3>
                  <p className="text-muted-foreground mb-4 text-center">View the original design in Figma</p>
                  <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Figma
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {selectedCommentId && (
            <div className="mt-4" ref={commentThreadRef}>
              <CommentThread 
                comment={prototype.comments.find(c => c.id === selectedCommentId)!}
                onClose={() => setSelectedCommentId(null)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
