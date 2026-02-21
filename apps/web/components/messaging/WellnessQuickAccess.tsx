"use client";

import React, { useState } from "react";
import { Wind, Heart, Music, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WellnessTool {
  id: string;
  name: string;
  tagalogName: string;
  icon: React.ReactNode;
  description: string;
  tagalogDescription: string;
  route?: string;
  action?: () => void;
}

const WELLNESS_TOOLS: WellnessTool[] = [
  {
    id: "breathing",
    name: "Breathing Exercises",
    tagalogName: "Ehersisyo sa Paghinga",
    icon: <Wind className="h-4 w-4" />,
    description: "Guided breathing to help you relax",
    tagalogDescription: "Gabay na paghinga para makarelax",
  },
  {
    id: "meditation",
    name: "Meditation Guide",
    tagalogName: "Gabay sa Meditasyon",
    icon: <Heart className="h-4 w-4" />,
    description: "Quick meditation sessions",
    tagalogDescription: "Mabilis na meditation",
  },
  {
    id: "music",
    name: "Calming Music",
    tagalogName: "Payapang Musika",
    icon: <Music className="h-4 w-4" />,
    description: "Soothing sounds and music",
    tagalogDescription: "Payapang tunog at musika",
  },
  {
    id: "journal",
    name: "Quick Journal",
    tagalogName: "Mabilis na Journal",
    icon: <BookOpen className="h-4 w-4" />,
    description: "Write down your thoughts",
    tagalogDescription: "Isulat ang iyong mga iniisip",
  },
];

interface WellnessQuickAccessProps {
  onToolSelect?: (toolId: string) => void;
  showTagalog?: boolean;
  className?: string;
}

export function WellnessQuickAccess({
  onToolSelect,
  showTagalog = false,
  className,
}: WellnessQuickAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleToolSelect = (tool: WellnessTool) => {
    setIsOpen(false);
    if (onToolSelect) {
      onToolSelect(tool.id);
    } else {
      // Open wellness tools popup (would need to integrate with FloatingToolsButton)
      // For now, just close the popover
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100",
            className
          )}
          aria-label="Wellness tools"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {showTagalog ? "Wellness Tools" : "Wellness Tools"}
            </h3>
            <p className="text-xs text-gray-500">
              {showTagalog ? "Kailangan mo ng kalmado?" : "Need to calm down?"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {WELLNESS_TOOLS.map((tool) => (
              <Button
                key={tool.id}
                variant="outline"
                size="sm"
                className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => handleToolSelect(tool)}
              >
                <div className="text-purple-600">{tool.icon}</div>
                <div className="text-center">
                  <div className="text-xs font-medium">
                    {showTagalog ? tool.tagalogName : tool.name}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {showTagalog
                      ? tool.tagalogDescription
                      : tool.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false);
                // This would trigger the wellness tools button
              }}
            >
              {showTagalog ? "Buksan ang lahat ng tools" : "Open all wellness tools"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

