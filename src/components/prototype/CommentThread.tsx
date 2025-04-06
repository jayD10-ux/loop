
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Author {
  name: string;
  avatarUrl?: string;
}

interface Reply {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
}

interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface CommentThreadProps {
  comment: Comment;
  onClose: () => void;
}

export function CommentThread({ comment, onClose }: CommentThreadProps) {
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      console.log("Submitting reply:", replyText);
      // In a real app, would send to API
      setReplyText("");
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold">Feedback Thread</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 mt-0.5">
            <AvatarImage src={comment.author.avatarUrl} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-sm">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        </div>
        
        {comment.replies.map((reply) => (
          <div key={reply.id} className="flex gap-3 ml-6">
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={reply.author.avatarUrl} />
              <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">{reply.author.name}</span>
                  <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                </div>
                <p className="text-sm">{reply.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmitReply}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 mt-0.5">
            <AvatarImage src="https://i.pravatar.cc/150?img=1" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              className="mb-2"
              placeholder="Add a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setReplyText("")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={!replyText.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
