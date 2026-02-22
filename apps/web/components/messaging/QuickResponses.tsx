"use client";

import React, { useState } from "react";
import { MessageSquare, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  QUICK_RESPONSES,
  getResponsesByCategory,
  searchResponses,
  type QuickResponse,
} from "@/lib/messaging/quickResponses";

interface QuickResponsesProps {
  onSelectResponse?: (response: QuickResponse, useTagalog?: boolean) => void;
  showTagalog?: boolean;
  className?: string;
}

const CATEGORIES = [
  { id: "all", label: "All", tagalog: "Lahat" },
  { id: "support", label: "Support", tagalog: "Suporta" },
  { id: "encouragement", label: "Encouragement", tagalog: "Pagpapalakas" },
  { id: "check-in", label: "Check-in", tagalog: "Kamustahan" },
  { id: "crisis", label: "Crisis", tagalog: "Krisis" },
  { id: "appointment", label: "Appointment", tagalog: "Appointment" },
] as const;

export function QuickResponses({
  onSelectResponse,
  showTagalog = false,
  className,
}: QuickResponsesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<QuickResponse["category"] | "all">("all");
  const [useTagalog, setUseTagalog] = useState(showTagalog);

  const filteredResponses = searchTerm
    ? searchResponses(searchTerm, useTagalog)
    : selectedCategory === "all"
    ? QUICK_RESPONSES
    : getResponsesByCategory(selectedCategory);

  const handleSelect = (response: QuickResponse) => {
    onSelectResponse?.(response, useTagalog);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-9 w-9 rounded-full", className)}
          aria-label="Quick responses"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {showTagalog ? "Mabilis na Sagot" : "Quick Responses"}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 text-xs",
                  !useTagalog && "bg-primary/10 text-primary"
                )}
                onClick={() => setUseTagalog(false)}
              >
                EN
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 text-xs",
                  useTagalog && "bg-primary/10 text-primary"
                )}
                onClick={() => setUseTagalog(true)}
              >
                TL
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder={showTagalog ? "Maghanap..." : "Search..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Categories */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {!searchTerm && (
                <div className="flex flex-wrap gap-1 pb-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => setSelectedCategory(cat.id as any)}
                    >
                      {useTagalog ? cat.tagalog : cat.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Responses */}
              <div className="space-y-1">
                {filteredResponses.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    {showTagalog ? "Walang nahanap" : "No responses found"}
                  </p>
                ) : (
                  filteredResponses.map((response) => (
                    <Button
                      key={response.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-xs hover:bg-gray-100"
                      onClick={() => handleSelect(response)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {response.emoji && (
                          <span className="text-base flex-shrink-0">{response.emoji}</span>
                        )}
                        <span className="flex-1 min-w-0">
                          {useTagalog ? response.tagalog : response.english}
                        </span>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

