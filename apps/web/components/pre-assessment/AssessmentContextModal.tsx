"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Brain, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DEMO_CONTEXT = {
  items: [
    { label: "Sleep patterns", detail: "Identified" },
    { label: "Stress triggers", detail: "Work / burnout" },
    { label: "Work–life balance", detail: "Boundaries, guilt" },
    { label: "Support system", detail: "Limited at work; pulling back from friends" },
    { label: "Coping & history", detail: "Previous therapy (college); open to CBT" },
  ],
};

export interface AssessmentContextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: Array<{ label: string; detail?: string }> | string[];
  useDemoContent?: boolean;
}

function normalizeItems(
  items: AssessmentContextModalProps["items"],
  useDemo: boolean
): Array<{ label: string; detail?: string }> {
  if (useDemo) return DEMO_CONTEXT.items;
  if (!items?.length) return DEMO_CONTEXT.items;
  return items.map((item) =>
    typeof item === "string" ? { label: item } : { label: item.label, detail: item.detail }
  );
}

export function AssessmentContextModal({
  open,
  onOpenChange,
  items,
  useDemoContent = false,
}: AssessmentContextModalProps) {
  const useDemo = useDemoContent || !items?.length;
  const displayItems = normalizeItems(items, useDemo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Assessment Context</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm">
            As you chat, our AI picks up themes and context—like sleep, stress, and support—so we can build your snapshot and match you with the right therapist.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              What we're gathering
            </h4>
            <ul className="space-y-3">
              {displayItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span>
                    <span className="font-medium text-foreground">{item.label}</span>
                    {item.detail != null && item.detail !== "" && (
                      <span className="text-muted-foreground"> — {item.detail}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-primary/80 mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Why this helps
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              A standard form can miss nuance. Conversation lets us capture how things really feel—so your snapshot is accurate and your therapist can meet you where you are.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
