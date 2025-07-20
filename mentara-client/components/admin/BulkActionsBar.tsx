'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Users,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkApprove: () => Promise<void>;
  onBulkReject: () => Promise<void>;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  isLoading = false,
}: BulkActionsBarProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">
                <Badge variant="secondary" className="mr-2">
                  {selectedCount}
                </Badge>
                {selectedCount === 1 ? 'therapist' : 'therapists'} selected
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk Approve */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve All ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Bulk Approve Therapists
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve <strong>{selectedCount}</strong> therapist application{selectedCount !== 1 ? 's' : ''}?
                    <br /><br />
                    This action will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Grant access to the therapist dashboard</li>
                      <li>Allow therapists to receive client requests</li>
                      <li>Send approval notification emails</li>
                      <li>Enable therapist profiles in search results</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onBulkApprove}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve All
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Reject */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject All ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Bulk Reject Therapists
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject <strong>{selectedCount}</strong> therapist application{selectedCount !== 1 ? 's' : ''}?
                    <br /><br />
                    This action will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Deny access to the therapist dashboard</li>
                      <li>Send rejection notification emails</li>
                      <li>Remove applications from pending queue</li>
                      <li>Archive application data</li>
                    </ul>
                    <br />
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="text-sm text-red-800">
                        This action cannot be easily undone. Consider individual review for complex cases.
                      </span>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onBulkReject}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Reject All
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-3 pt-3 border-t border-primary/10">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Bulk actions will process all selected applications with a standard approval/rejection message. 
            For applications requiring detailed review, consider individual processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}