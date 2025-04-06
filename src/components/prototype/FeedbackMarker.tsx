
import { Badge } from "@/components/ui/badge";

interface FeedbackMarkerProps {
  id: string;
  x: number;
  y: number;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

export function FeedbackMarker({ 
  id, 
  x, 
  y, 
  count, 
  isSelected, 
  onClick 
}: FeedbackMarkerProps) {
  return (
    <div 
      className={`feedback-marker absolute cursor-pointer ${isSelected ? 'z-50' : 'z-40'}`} 
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: 'translate(-50%, -50%)' 
      }}
      onClick={onClick}
    >
      <Badge 
        className={`
          h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold shadow-md
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
