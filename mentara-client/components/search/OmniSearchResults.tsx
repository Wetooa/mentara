'use client';

import React from 'react';
import { Search, User, Users, FileText, MessageCircle, PenTool, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { type EntityType } from './OmniSearchBar';

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  description?: string;
  subtitle?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  url?: string;
}

export interface OmniSearchResultsData {
  users?: any[];
  therapists?: any[];
  posts?: any[];
  communities?: any[];
  worksheets?: any[];
  messages?: any[];
}

interface OmniSearchResultsProps {
  results: OmniSearchResultsData;
  query: string;
  isLoading?: boolean;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

const ENTITY_ICONS = {
  users: User,
  therapists: Users,
  posts: FileText,
  communities: Building,
  worksheets: PenTool,
  messages: MessageCircle,
};

const ENTITY_COLORS = {
  users: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  therapists: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  posts: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  communities: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  worksheets: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  messages: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

function formatSearchResult(item: any, type: EntityType): SearchResult {
  switch (type) {
    case 'users':
      return {
        id: item.id,
        type: 'users',
        title: `${item.firstName} ${item.lastName}`,
        subtitle: item.email,
        description: `${item.role} • Joined ${new Date(item.createdAt).toLocaleDateString()}`,
        avatarUrl: item.avatarUrl,
        url: `/profile/${item.id}`,
      };
    
    case 'therapists':
      return {
        id: item.id,
        type: 'therapists',
        title: `${item.user.firstName} ${item.user.lastName}`,
        subtitle: item.bio ? item.bio.slice(0, 100) + '...' : '',
        description: item.expertise ? `Specializes in: ${item.expertise.slice(0, 3).join(', ')}` : '',
        avatarUrl: item.user.avatarUrl,
        url: `/therapist/${item.id}`,
      };
    
    case 'posts':
      return {
        id: item.id,
        type: 'posts',
        title: item.title,
        subtitle: item.content ? item.content.slice(0, 150) + '...' : '',
        description: `By ${item.user.firstName} ${item.user.lastName} • ${item._count.hearts} hearts`,
        avatarUrl: item.user.avatarUrl,
        url: `/post/${item.id}`,
      };
    
    case 'communities':
      return {
        id: item.id,
        type: 'communities',
        title: item.name,
        subtitle: item.description,
        description: `${item._count.memberships} members`,
        url: `/community/${item.slug}`,
      };
    
    case 'worksheets':
      return {
        id: item.id,
        type: 'worksheets',
        title: item.title,
        subtitle: item.instructions ? item.instructions.slice(0, 150) + '...' : '',
        description: `Client: ${item.client.user.firstName} ${item.client.user.lastName} • Due: ${new Date(item.dueDate).toLocaleDateString()}`,
        url: `/worksheet/${item.id}`,
      };
    
    case 'messages':
      return {
        id: item.id,
        type: 'messages',
        title: item.content.slice(0, 100) + (item.content.length > 100 ? '...' : ''),
        subtitle: `From ${item.sender.firstName} ${item.sender.lastName}`,
        description: `In ${item.conversation.title || 'conversation'} • ${new Date(item.createdAt).toLocaleDateString()}`,
        avatarUrl: item.sender.avatarUrl,
        url: `/messages?conversation=${item.conversation.id}&message=${item.id}`,
      };
    
    default:
      return {
        id: item.id,
        type,
        title: item.title || item.name || 'Unknown',
        subtitle: item.description || '',
        description: '',
      };
  }
}

function SearchResultCard({ result, onClick }: { result: SearchResult; onClick?: (result: SearchResult) => void }) {
  const Icon = ENTITY_ICONS[result.type];
  const colorClass = ENTITY_COLORS[result.type];

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(result)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar or Icon */}
          <div className="flex-shrink-0">
            {result.avatarUrl ? (
              <Avatar className="w-10 h-10">
                <AvatarImage src={result.avatarUrl} alt={result.title} />
                <AvatarFallback>
                  <Icon className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colorClass)}>
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{result.title}</h3>
              <Badge variant="secondary" className={cn('text-xs', colorClass)}>
                {result.type}
              </Badge>
            </div>
            
            {result.subtitle && (
              <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                {result.subtitle}
              </p>
            )}
            
            {result.description && (
              <p className="text-xs text-muted-foreground">
                {result.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-12">
      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No results found</h3>
      <p className="text-muted-foreground mb-4">
        {query ? `No results found for "${query}"` : 'Start typing to search'}
      </p>
      <div className="text-sm text-muted-foreground">
        <p>Try:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Using different keywords</li>
          <li>Checking your spelling</li>
          <li>Using fewer filters</li>
          <li>Searching for more general terms</li>
        </ul>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const OmniSearchResults: React.FC<OmniSearchResultsProps> = ({
  results,
  query,
  isLoading = false,
  className = '',
  onResultClick,
}) => {
  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <LoadingState />
      </div>
    );
  }

  // Convert results to unified format
  const allResults: SearchResult[] = [];
  
  Object.entries(results).forEach(([type, items]) => {
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        allResults.push(formatSearchResult(item, type as EntityType));
      });
    }
  });

  if (allResults.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <EmptyState query={query} />
      </div>
    );
  }

  // Group results by type for organized display
  const groupedResults = allResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<EntityType, SearchResult[]>);

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {allResults.length} result{allResults.length !== 1 ? 's' : ''} 
          {query && ` for "${query}"`}
        </p>
        <div className="flex gap-2">
          {Object.entries(groupedResults).map(([type, typeResults]) => {
            const Icon = ENTITY_ICONS[type as EntityType];
            return (
              <Badge key={type} variant="outline" className="text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {typeResults.length} {type}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Results by Type */}
      {Object.entries(groupedResults).map(([type, typeResults], index) => {
        const Icon = ENTITY_ICONS[type as EntityType];
        return (
          <div key={type}>
            {index > 0 && <Separator className="my-6" />}
            
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className="w-5 h-5" />
              <h2 className="text-lg font-semibold capitalize">{type}</h2>
              <Badge variant="secondary">{typeResults.length}</Badge>
            </div>

            {/* Results Grid */}
            <div className="grid gap-3">
              {typeResults.map(result => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  onClick={onResultClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OmniSearchResults;