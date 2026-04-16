"use client";

import React, { useState } from "react";
import { AlertTriangle, Phone, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  PHILIPPINES_CRISIS_HOTLINES,
  CRISIS_MESSAGE_TEMPLATES,
  getPrimaryHotlines,
  formatPhoneNumber,
  type CrisisHotline,
  type CrisisMessageTemplate,
} from "@/lib/messaging/crisisSupport";
import { CrisisSupportModal } from "@/components/crisis/CrisisSupportModal";

interface CrisisSupportButtonProps {
  onSendCrisisMessage?: (message: string, priority: "urgent" | "high" | "normal") => void;
  className?: string;
}

export function CrisisSupportButton({
  onSendCrisisMessage,
  className,
}: CrisisSupportButtonProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CrisisMessageTemplate | null>(null);

  const primaryHotlines = getPrimaryHotlines();

  const handleTemplateSelect = (template: CrisisMessageTemplate) => {
    setSelectedTemplate(template);
    setIsPopoverOpen(false);
    if (onSendCrisisMessage) {
      onSendCrisisMessage(template.message, template.priority);
    }
  };

  const handleCallHotline = (hotline: CrisisHotline) => {
    if (hotline.phone) {
      window.location.href = `tel:${hotline.phone.replace(/[^0-9+]/g, "")}`;
    }
  };

  const handleTextHotline = (hotline: CrisisHotline) => {
    if (hotline.textNumber) {
      window.location.href = `sms:${hotline.textNumber.replace(/[^0-9+]/g, "")}`;
    }
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
              className
            )}
            aria-label="Crisis support"
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900">
                Crisis Support
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsPopoverOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Need immediate help? Choose an option below.
            </p>

            <Separator />

            {/* Quick Templates */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Send urgent message:
              </p>
              {CRISIS_MESSAGE_TEMPLATES.slice(0, 2).map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{template.title}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <Separator />

            {/* Quick Hotline Access */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Call for help:
              </p>
              {primaryHotlines.slice(0, 2).map((hotline) => (
                <div
                  key={hotline.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {hotline.name}
                    </p>
                    <p className="text-xs text-gray-600">{formatPhoneNumber(hotline.phone)}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {hotline.phone && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCallHotline(hotline)}
                        aria-label={`Call ${hotline.name}`}
                      >
                        <Phone className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                    {hotline.textNumber && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleTextHotline(hotline)}
                        aria-label={`Text ${hotline.name}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsPopoverOpen(false);
                setIsModalOpen(true);
              }}
            >
              View all resources
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CrisisSupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        emergencyType="general"
      />
    </>
  );
}

