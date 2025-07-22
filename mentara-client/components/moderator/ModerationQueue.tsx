"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
  // AlertTriangle,
  // Flag,
} from "lucide-react";
import { format } from "date-fns";
import { useContentModerationQueue, useModerateContent } from "@/hooks/moderator/useModerator";
import type { Post, Comment, ContentModerationParams } from "@/types/api";

interface ModerationQueueProps {
  className?: string;
}

export function ModerationQueue({ className }: ModerationQueueProps) {
  const [filters, setFilters] = useState<ContentModerationParams>({
    status: 'pending',
    limit: 20,
    offset: 0,
  });
  const [selectedContent, setSelectedContent] = useState<(Post | Comment) | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'flag' | 'remove' | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const { 
    data: queueData, 
    isLoading, 
    refetch 
  } = useContentModerationQueue(filters);

  const moderateContent = useModerateContent();

  const content = queueData?.content || [];
  const total = queueData?.total || 0;

  const handleAction = (
    item: Post | Comment,
    action: 'approve' | 'reject' | 'flag' | 'remove'
  ) => {
    setSelectedContent(item);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedContent || !actionType) return;

    const contentType = 'title' in selectedContent ? 'post' : 'comment';
    
    await moderateContent.mutateAsync({
      contentType,
      contentId: selectedContent.id,
      data: {
        action: actionType,
        reason,
        note,
      },
    });

    setActionDialogOpen(false);
    setReason("");
    setNote("");
    setSelectedContent(null);
    setActionType(null);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getContentTypeBadge = (item: Post | Comment) => {
    if ('title' in item) {
      return <Badge variant="outline">Post</Badge>;
    }
    return <Badge variant="outline">Comment</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Moderation Queue
              </CardTitle>
              <CardDescription>
                Review and moderate flagged content ({total} items)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select 
                  value={filters.type} 
                  onValueChange={(value: string) => setFilters({...filters, type: value as 'all' | 'post' | 'comment'})}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.priority} 
                  onValueChange={(value: string) => setFilters({...filters, priority: value as 'all' | 'urgent' | 'high' | 'medium' | 'low'})}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading moderation queue...
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No content in moderation queue</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs">
                      <div>
                        {'title' in item && (
                          <p className="font-medium text-sm mb-1">{item.title}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {truncateContent(item.content)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getContentTypeBadge(item)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.author?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{item.author?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {(item as Post | Comment & { reportCount?: number }).reportCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge((item as Post | Comment & { priority?: string }).priority || 'medium')}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContent(item);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleAction(item, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:bg-orange-50"
                          onClick={() => handleAction(item, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(item, 'remove')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Content Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Content Preview</DialogTitle>
            <DialogDescription>
              Review the full content and its context
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getContentTypeBadge(selectedContent)}
                  {getPriorityBadge((selectedContent as Post | Comment & { priority?: string }).priority || 'medium')}
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {(selectedContent as Post | Comment & { reportCount?: number }).reportCount || 0} Reports
                </Badge>
              </div>

              {'title' in selectedContent && (
                <div>
                  <h3 className="font-semibold text-lg">{selectedContent.title}</h3>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedContent.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Author:</span>{" "}
                  {selectedContent.author?.name || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(selectedContent.createdAt)}
                </div>
                {'communityId' in selectedContent && (
                  <div>
                    <span className="font-medium">Community:</span>{" "}
                    {(selectedContent as Post | Comment & { community?: { name?: string } }).community?.name || 'Unknown'}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => {
                      setPreviewOpen(false);
                      handleAction(selectedContent, 'approve');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      setPreviewOpen(false);
                      handleAction(selectedContent, 'reject');
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setPreviewOpen(false);
                      handleAction(selectedContent, 'remove');
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' && 'Approve Content'}
              {actionType === 'reject' && 'Reject Content'}
              {actionType === 'flag' && 'Flag Content'}
              {actionType === 'remove' && 'Remove Content'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' && 'This will approve the content and make it visible to all users.'}
              {actionType === 'reject' && 'This will reject the content without removing it completely.'}
              {actionType === 'flag' && 'This will flag the content for further review.'}
              {actionType === 'remove' && 'This will permanently remove the content from the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Enter the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Additional Notes (Optional)</label>
              <Textarea
                placeholder="Any additional notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={!reason.trim() || moderateContent.isPending}
              className={
                actionType === 'approve'
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === 'reject'
                    ? "bg-orange-600 hover:bg-orange-700"
                    : actionType === 'remove'
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {moderateContent.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Confirm {actionType}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}