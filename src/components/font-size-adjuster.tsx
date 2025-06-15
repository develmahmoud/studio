"use client";

import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSettings, MIN_FONT_SCALE, MAX_FONT_SCALE, FONT_SCALE_STEP } from '@/contexts/app-settings-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function FontSizeAdjuster() {
  const { fontScale, setFontScale } = useAppSettings();

  const increaseFontSize = () => {
    setFontScale(prev => Math.min(MAX_FONT_SCALE, prev + FONT_SCALE_STEP));
  };

  const decreaseFontSize = () => {
    setFontScale(prev => Math.max(MIN_FONT_SCALE, prev - FONT_SCALE_STEP));
  };
  
  // Ensure this only runs client-side for initial state consistency
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="flex items-center gap-1"><div className="w-10 h-10" /><div className="w-10 h-10" /></div>;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseFontSize}
              disabled={fontScale <= MIN_FONT_SCALE}
              aria-label="Decrease font size"
            >
              <ZoomOut />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease font size</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseFontSize}
              disabled={fontScale >= MAX_FONT_SCALE}
              aria-label="Increase font size"
            >
              <ZoomIn />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase font size</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
