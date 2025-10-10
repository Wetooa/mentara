'use client';

import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  MessageCircle,
  RefreshCw,
  Search,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  community: {
    id: string;
    name: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
  };
  comments: {
    count: number;
    preview?: Array<{
      id: string;
      content: string;
      author: {
        id: string;
        name: string;
      };
    }>;
  };
  tags?: string[];
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

interface PostFilters {
  sort: 'hot' | 'new' | 'top' | 'controversial';
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  category?: string;
  search?: string;
}

interface PostListProps {
  communityId?: string;
  showCreateButton?: boolean;
  showFilters?: boolean;
  initialSort?: 'hot' | 'new' | 'top' | 'controversial';
  className?: string;
  onCreatePost?: () => void;
}

export function PostList({ 
  communityId, 
  showCreateButton = true,
  showFilters = true,
  initialSort = 'hot',
  className = '',
  onCreatePost
}: PostListProps) {
  const api = useApi();
  const [filters, setFilters] = useState<PostFilters>({
    sort: initialSort,
    timeframe: 'day',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Infinite query for posts
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts', 'list', { 
      communityId, 
      ...filters, 
      search: searchQuery 
    }],
    queryFn: ({ pageParam = 0 }) => 
      api.posts.getList({
        communityId,
        page: pageParam,
        limit: 20,
        sort: filters.sort,
        timeframe: filters.timeframe,
        category: filters.category,
        search: searchQuery,
      }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) {
        return pages.length;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load more posts when intersection observer triggers
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchQuery }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.search]);

  const handleSortChange = (newSort: 'hot' | 'new' | 'top' | 'controversial') => {
    setFilters(prev => ({ ...prev, sort: newSort }));
  };

  const handleTimeframeChange = (timeframe: string) => {
    setFilters(prev => ({ 
      ...prev, 
      timeframe: timeframe as PostFilters['timeframe'] 
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Posts refreshed');
    } catch {
      toast.error('Failed to refresh posts');
    } finally {
      setIsRefreshing(false);
    }
  };

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Posts</h3>
          <p className="text-muted-foreground mb-4">
            Unable to load posts. Please try again.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Create Button */}
      {showCreateButton && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Posts</h2>
          <Button onClick={onCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full h-10 px-3 border border-input bg-background rounded-md"
        />
      </div>

      {/* Filters and Sorting */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sort Tabs */}
          <Tabs value={filters.sort} onValueChange={handleSortChange} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hot" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Hot
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="top" className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Top
              </TabsTrigger>
              <TabsTrigger value="controversial" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Hot
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Timeframe Filter (for top posts) */}
          {filters.sort === 'top' && (
            <Select value={filters.timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Past Hour</SelectItem>
                <SelectItem value="day">Past Day</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-16 w-full" />
                      <div className="flex space-x-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'No posts match your search criteria.' 
                  : 'Be the first to create a post in this community!'
                }
              </p>
              {!searchQuery && onCreatePost && (
                <Button onClick={onCreatePost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Posts will be rendered here using PostItem component */}
            {allPosts.map((post: Post) => (
              <div key={post.id} className="space-y-4">
                {/* Placeholder for PostItem component */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      {/* Vote Section Placeholder */}
                      <div className="flex flex-col items-center space-y-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          {post.votes.upvotes - post.votes.downvotes}
                        </span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <TrendingUp className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                      
                      {/* Post Content Placeholder */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-muted-foreground mb-3 line-clamp-3">
                          {post.excerpt || post.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>by {post.author.name}</span>
                          <span>•</span>
                          <span>{post.comments.count} comments</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div ref={ref} className="flex justify-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading more posts...</span>
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => fetchNextPage()}
                  >
                    Load More Posts
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}