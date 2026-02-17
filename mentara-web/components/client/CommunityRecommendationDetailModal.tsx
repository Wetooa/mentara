"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users } from "lucide-react";
import type { CommunityRecommendation } from "@/lib/api/services/communities";

interface CommunityRecommendationDetailModalProps {
  community: CommunityRecommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinGroup: (community: CommunityRecommendation) => Promise<void>;
  isJoining?: boolean;
}

export function CommunityRecommendationDetailModal({
  community,
  open,
  onOpenChange,
  onJoinGroup,
  isJoining = false,
}: CommunityRecommendationDetailModalProps) {
  if (!community) return null;

  const handleJoin = async () => {
    await onJoinGroup(community);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{community.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{community.description}</p>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                Matches your Snapshot
              </p>
              <p className="text-sm text-muted-foreground">{community.reason}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{community.memberCount} members</span>
              </div>
            </CardContent>
          </Card>
          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
