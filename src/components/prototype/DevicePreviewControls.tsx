
import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DevicePreviewControlsProps {
  activeDevice: string;
  onDeviceChange: (device: string) => void;
  className?: string;
}

export function DevicePreviewControls({
  activeDevice,
  onDeviceChange,
  className = '',
}: DevicePreviewControlsProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Button
        variant={activeDevice === "desktop" ? "default" : "outline"}
        size="sm"
        onClick={() => onDeviceChange("desktop")}
        title="Desktop view"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={activeDevice === "tablet" ? "default" : "outline"}
        size="sm"
        onClick={() => onDeviceChange("tablet")}
        title="Tablet view"
      >
        <Tablet className="h-4 w-4" />
      </Button>
      <Button
        variant={activeDevice === "mobile" ? "default" : "outline"}
        size="sm"
        onClick={() => onDeviceChange("mobile")}
        title="Mobile view"
      >
        <Smartphone className="h-4 w-4" />
      </Button>
    </div>
  );
}
