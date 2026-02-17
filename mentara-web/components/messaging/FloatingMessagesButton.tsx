"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles, MessageSquareText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getStorageItem, setStorageItem } from "@/lib/config/storage";

// Lazy load MessengerInterface
const MessengerInterface = dynamic(
  () =>
    import("@/components/messaging/MessengerInterface").then((mod) => ({
      default: mod.MessengerInterface,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full p-6 flex flex-col">
        <div className="flex-1 min-h-0 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    ),
  }
);

const MESSAGES_POPUP_WIDTH_KEY = "messages-popup-width";

// Default width in vw (viewport width percentage)
const DEFAULT_WIDTH = 50; // 50vw
const MIN_WIDTH = 30; // 30vw
const MAX_WIDTH = 90; // 90vw

export function FloatingMessagesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [panelSize, setPanelSize] = useState(() => {
    const saved = getStorageItem<number>(MESSAGES_POPUP_WIDTH_KEY, DEFAULT_WIDTH);
    // Ensure saved value is within bounds
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, saved));
  });

  const handleCallInitiate = async (
    conversationId: string,
    type: "audio" | "video"
  ) => {
    // Handle call initiation - could navigate to call page or show modal
    console.log("Call initiate:", conversationId, type);
  };

  const handleVideoMeetingJoin = (conversationId: string) => {
    // Handle video meeting join
    console.log("Video meeting join:", conversationId);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-messages-button]')
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when popup is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button - Positioned on left side */}
      <motion.div
        initial={false}
        animate={{ scale: isOpen ? 0.9 : 1 }}
        className="fixed bottom-40 left-4 z-40 md:bottom-8 md:left-8"
        data-messages-button
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
          aria-label={isOpen ? "Close messages" : "Open messages"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 md:bg-black/30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Messages Popup - Slides from left with resizable width */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50",
              "bg-white shadow-2xl",
              "flex flex-col",
              "border-r border-gray-200"
            )}
            style={{
              width: `${panelSize}vw`,
              minWidth: "400px",
              maxWidth: "90vw",
            }}
          >
            {/* Header - Enhanced Design */}
            <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              </div>
              
              {/* Sparkle decoration */}
              <div className="absolute top-2 right-16 opacity-20">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              
              <div className="relative flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  {/* Icon with animation */}
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-md" />
                    <div className="relative bg-white/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/30">
                      <MessageSquareText className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        Conversations
                      </h2>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="h-1.5 w-1.5 bg-white rounded-full"
                      />
                    </div>
                    <p className="text-sm text-white/90 mt-0.5 font-medium">
                      Stay connected with your support network
                    </p>
                  </div>
                  </div>
                  
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Open Philippines resources
                      window.open("https://ncmh.gov.ph", "_blank");
                    }}
                    className="h-9 w-9 rounded-full hover:bg-white/20 text-white hover:text-white border border-white/20 transition-all"
                    aria-label="Philippines mental health resources"
                    title="Philippines Mental Health Resources"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-9 w-9 rounded-full hover:bg-white/20 text-white hover:text-white border border-white/20 transition-all"
                    aria-label="Close messages"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <MessengerInterface
                onCallInitiate={handleCallInitiate}
                onVideoMeetingJoin={handleVideoMeetingJoin}
                className="h-full w-full"
              />
            </div>
            
            {/* Resize Handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 bg-transparent transition-colors group z-10"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX;
                const startWidth = popupRef.current?.offsetWidth || 500;
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const diff = startX - moveEvent.clientX; // Inverted because we're on the left
                  const newWidth = startWidth + diff;
                  const viewportWidth = window.innerWidth;
                  const percentage = (newWidth / viewportWidth) * 100;
                  
                  // Clamp between 30vw and 90vw
                  const clamped = Math.max(30, Math.min(90, percentage));
                  setPanelSize(clamped);
                  setStorageItem(MESSAGES_POPUP_WIDTH_KEY, clamped);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                  document.body.style.cursor = "";
                  document.body.style.userSelect = "";
                };
                
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-16 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
