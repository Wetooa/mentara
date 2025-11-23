"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick: () => void;
  isActive?: boolean;
}

interface ContextualSidebarProps {
  title: string;
  description?: string;
  items: SidebarItem[];
  quickActions?: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export function ContextualSidebar({
  title,
  description,
  items,
  quickActions,
  className,
  defaultExpanded = true,
}: ContextualSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const width = isExpanded ? "w-72" : "w-16";

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 288 : 64 }}
      className={cn(
        "bg-white border-r border-border/50 flex flex-col sticky top-0 h-screen shadow-sm transition-all duration-300",
        width,
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between flex-shrink-0">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1"
            >
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 flex-shrink-0"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items - Scrollable */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative group",
              item.isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-gray-700 hover:bg-gray-50 border border-transparent"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.icon && (
              <span
                className={cn(
                  "flex-shrink-0",
                  item.isActive ? "text-primary" : "text-gray-500"
                )}
              >
                {item.icon}
              </span>
            )}
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {item.badge && isExpanded && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary"
              >
                {item.badge}
              </motion.span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Quick Actions - Fixed at bottom */}
      {quickActions && isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-3 border-t border-border/50 flex-shrink-0 overflow-y-auto max-h-[200px]"
        >
          {quickActions}
        </motion.div>
      )}

      {/* Footer (only when expanded) - Removed to prevent overflow */}
    </motion.aside>
  );
}
