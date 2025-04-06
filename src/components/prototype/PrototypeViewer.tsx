
import { useState } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Code, 
  MessageSquare, 
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink, 
  Plus 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackMarker } from "./FeedbackMarker";
import { CommentThread } from "./CommentThread";

interface PrototypeViewerProps {
  id: string;
}

export function PrototypeViewer({ id }: PrototypeViewerProps) {
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  
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
  };

  const toggleFeedbackMode = () => {
    setFeedbackMode(!feedbackMode);
    // Clear selected comment when toggling mode
    setSelectedCommentId(null);
  };

  const handleCommentSelect = (commentId: string) => {
    setSelectedCommentId(commentId === selectedCommentId ? null : commentId);
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">{prototype.title}</h1>
            <p className="text-muted-foreground mt-1">{prototype.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={prototype.createdBy.avatarUrl} />
                <AvatarFallback>{prototype.createdBy.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{prototype.createdBy.name}</p>
                <p className="text-xs text-muted-foreground">Updated {prototype.updatedAt}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Figma
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="preview">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="bg-background border rounded-md p-1 flex items-center">
                <Button
                  variant={activeDevice === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleDeviceChange("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeDevice === "tablet" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleDeviceChange("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeDevice === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleDeviceChange("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant={feedbackMode ? "secondary" : "outline"}
                size="sm"
                onClick={toggleFeedbackMode}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </div>
          </div>
          
          <TabsContent value="preview" className="mt-0">
            <div className={`relative border rounded-lg overflow-hidden bg-gray-100 ${
              activeDevice === "desktop" ? "w-full" : 
              activeDevice === "tablet" ? "w-[768px] mx-auto" : 
              "w-[375px] mx-auto"
            }`}>
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
                      className="absolute bottom-4 right-4 animate-slide-in"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feedback
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
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
        </Tabs>
        
        {selectedCommentId && (
          <div className="mt-4 animate-fade-in">
            <CommentThread 
              comment={prototype.comments.find(c => c.id === selectedCommentId)!}
              onClose={() => setSelectedCommentId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
