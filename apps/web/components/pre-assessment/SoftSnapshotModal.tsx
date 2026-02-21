"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Heart, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DEMO_SNAPSHOT = {
  summary:
    "Based on our conversation, you're experiencing work-related stress and burnout, with impact on sleep and daily energy. You're open to practical approaches and have had positive therapy experience in the past.",
  primaryConcerns: ["Burnout", "Work stress", "Sleep difficulties", "Boundaries"],
  traitsAndReadiness: ["High openness", "Prefers structured therapy (e.g. CBT)", "Previous therapy experience"],
};

export interface SoftSnapshotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags?: string[];
  useDemoContent?: boolean;
}

export function SoftSnapshotModal({
  open,
  onOpenChange,
  tags,
  useDemoContent = false,
}: SoftSnapshotModalProps) {
  const useDemo = useDemoContent || !tags?.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">My Snapshot</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm">
            Your conversation is turned into a short, standardized profile so your therapist has context before your first session—no need to repeat everything.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {useDemo ? (
            <>
              <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Summary
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {DEMO_SNAPSHOT.summary}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  Primary concerns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DEMO_SNAPSHOT.primaryConcerns.map((label, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 font-medium"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Personality & readiness
                </h4>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {DEMO_SNAPSHOT.traitsAndReadiness.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <p className="text-xs text-muted-foreground">
                This snapshot is shared only with therapists you choose or are matched with, so they can prepare and personalize your first session.
              </p>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200/80 bg-gray-50/50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Tags from your assessment
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags!.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This snapshot is shared only with therapists you choose or are matched with.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
