import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";

interface FeedbackMarkerProps {
  id: string;
  x: number;
  y: number;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function FeedbackMarker({ 
  id, 
  x, 
  y, 
  count, 
  isSelected, 
  onClick,
  className = ''
}: FeedbackMarkerProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={markerRef}
      className={`
        feedback-marker absolute cursor-pointer 
        transition-all duration-300 ease-out
        ${isSelected ? 'scale-110 z-50' : 'scale-100 z-40'}
        ${className}
      `} 
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.1)' : 'scale(1)'}` 
      }}
      onClick={onClick}
    >
      <Badge 
        className={`
          h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold shadow-md
          transition-colors duration-300
          ${isSelected 
            ? 'bg-loop-purple hover:bg-loop-purple' 
            : 'bg-loop-blue hover:bg-loop-blue/90'
          }
        `}
      >
        {count}
      </Badge>
    </div>
  );
}
