"use client";

import React, { useState } from "react";
import { Smile, Frown, Meh, AlertCircle, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Mood = "happy" | "neutral" | "sad" | "anxious" | "tired" | null;

interface MoodOption {
  id: Mood;
  emoji: string;
  label: string;
  tagalogLabel: string;
  icon: React.ReactNode;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "happy",
    emoji: "😊",
    label: "Happy",
    tagalogLabel: "Masaya",
    icon: <Smile className="h-4 w-4" />,
    color: "text-yellow-500",
  },
  {
    id: "neutral",
    emoji: "😐",
    label: "Neutral",
    tagalogLabel: "Normal",
    icon: <Meh className="h-4 w-4" />,
    color: "text-gray-500",
  },
  {
    id: "sad",
    emoji: "😢",
    label: "Sad",
    tagalogLabel: "Malungkot",
    icon: <Frown className="h-4 w-4" />,
    color: "text-blue-500",
  },
  {
    id: "anxious",
    emoji: "😰",
    label: "Anxious",
    tagalogLabel: "Nababahala",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-orange-500",
  },
  {
    id: "tired",
    emoji: "😴",
    label: "Tired",
    tagalogLabel: "Pagod",
    icon: <Moon className="h-4 w-4" />,
    color: "text-purple-500",
  },
];

interface MoodSelectorProps {
  currentMood?: Mood;
  onMoodSelect?: (mood: Mood) => void;
  showTagalog?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MoodSelector({
  currentMood,
  onMoodSelect,
  showTagalog = false,
  className,
  size = "md",
}: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedMood = MOOD_OPTIONS.find((m) => m.id === currentMood);

  const handleMoodSelect = (mood: Mood) => {
    onMoodSelect?.(mood);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full border-2 hover:bg-gray-50 transition-all",
            selectedMood
              ? `${selectedMood.color} border-current bg-current/10`
              : "border-gray-300 text-gray-600",
            sizeClasses[size],
            className
          )}
          aria-label="Select mood"
        >
          {selectedMood ? (
            <span className="text-lg">{selectedMood.emoji}</span>
          ) : (
            <Smile className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700 px-2 py-1">
            {showTagalog ? "Paano ka ngayon?" : "How are you feeling?"}
          </p>
          <div className="grid grid-cols-5 gap-1">
            {MOOD_OPTIONS.map((mood) => (
              <Button
                key={mood.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-1",
                  currentMood === mood.id && "bg-primary/10"
                )}
                onClick={() => handleMoodSelect(mood.id)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-[10px] leading-tight">
                  {showTagalog ? mood.tagalogLabel : mood.label}
                </span>
              </Button>
            ))}
          </div>
          {currentMood && (
            <>
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-gray-600"
                onClick={() => handleMoodSelect(null)}
              >
                Clear mood
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Get mood emoji by mood ID
 */
export function getMoodEmoji(mood: Mood): string {
  const moodOption = MOOD_OPTIONS.find((m) => m.id === mood);
  return moodOption?.emoji || "😐";
}

/**
 * Get mood label by mood ID
 */
export function getMoodLabel(mood: Mood, tagalog = false): string {
  const moodOption = MOOD_OPTIONS.find((m) => m.id === mood);
  if (!moodOption) return "Neutral";
  return tagalog ? moodOption.tagalogLabel : moodOption.label;
}

