"use client";

import React from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import type { Post, Comment, ContentModerationParams } from "@/types/api";

interface ModerationQueueProps {
  content?: (Post | Comment)[];
  total?: number;
  isLoading?: boolean;
  filters?: ContentModerationParams;
  onFiltersChange?: (filters: Partial<ContentModerationParams>) => void;
  onRefresh?: () => void;
  onPreview?: (item: Post | Comment) => void;
  onAction?: (item: Post | Comment, action: 'approve' | 'reject' | 'remove') => void;
  className?: string;
}

export function ModerationQueue({
  content = [],
  total = 0,
  isLoading = false,
  filters = {},
  onFiltersChange,
  onRefresh,
  onPreview,
  onAction,
  className,
}: ModerationQueueProps) {
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
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select 
                  value={filters.type || 'all'} 
                  onValueChange={(value: string) => onFiltersChange?.({ type: value === 'all' ? undefined : value as 'post' | 'comment' })}
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
                  value={filters.priority || 'all'} 
                  onValueChange={(value: string) => onFiltersChange?.({ priority: value === 'all' ? undefined : value as 'urgent' | 'high' | 'medium' | 'low' })}
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
                        {(item as { reportCount?: number }).reportCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge((item as { priority?: string }).priority || 'medium')}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPreview?.(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => onAction?.(item, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:bg-orange-50"
                          onClick={() => onAction?.(item, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => onAction?.(item, 'remove')}
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
    </div>
  );
}