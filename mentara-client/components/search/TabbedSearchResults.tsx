'use client';

import React, { useState } from 'react';
import { Search, User, Users, FileText, MessageCircle, PenTool, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export interface TabbedSearchResultsData {
  users?: any[];
  therapists?: any[];
  posts?: any[];
  communities?: any[];
  worksheets?: any[];
  messages?: any[];
}

interface TabbedSearchResultsProps {
  results: TabbedSearchResultsData;
  query: string;
  isLoading?: boolean;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
  defaultTab?: EntityType;
}

// Reddit-style tab configuration - Posts first like Reddit
const TAB_CONFIG: Array<{
  key: EntityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    key: 'posts',
    label: 'Posts',
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    key: 'communities',
    label: 'Communities', 
    icon: Building,
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    key: 'users',
    label: 'People',
    icon: User,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'therapists',
    label: 'Therapists',
    icon: Users,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'worksheets',
    label: 'Worksheets',
    icon: PenTool,
    color: 'text-pink-600 dark:text-pink-400',
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    color: 'text-cyan-600 dark:text-cyan-400',
  },
];

const ENTITY_COLORS = {
  users: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  therapists: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  posts: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
  communities: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
  worksheets: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
  messages: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800',
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
        description: `By ${item.user.firstName} ${item.user.lastName} • ${item._count?.hearts || 0} hearts • ${item._count?.comments || 0} comments`,
        avatarUrl: item.user.avatarUrl,
        url: `/post/${item.id}`,
        metadata: {
          community: item.room?.roomGroup?.community?.name,
          createdAt: item.createdAt,
        },
      };
    
    case 'communities':
      return {
        id: item.id,
        type: 'communities',
        title: item.name,
        subtitle: item.description,
        description: `${item._count?.memberships || 0} members`,
        url: `/community/${item.slug}`,
        metadata: {
          imageUrl: item.imageUrl,
        },
      };
    
    case 'worksheets':
      return {
        id: item.id,
        type: 'worksheets',
        title: item.title,
        subtitle: item.instructions ? item.instructions.slice(0, 150) + '...' : '',
        description: `Client: ${item.client?.user?.firstName || 'Unknown'} ${item.client?.user?.lastName || ''} • ${item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : 'No due date'}`,
        url: `/worksheet/${item.id}`,
      };
    
    case 'messages':
      return {
        id: item.id,
        type: 'messages',
        title: item.content.slice(0, 100) + (item.content.length > 100 ? '...' : ''),
        subtitle: `From ${item.sender?.firstName || 'Unknown'} ${item.sender?.lastName || ''}`,
        description: `In ${item.conversation?.title || 'conversation'} • ${new Date(item.createdAt).toLocaleDateString()}`,
        avatarUrl: item.sender?.avatarUrl,
        url: `/messages?conversation=${item.conversation?.id}&message=${item.id}`,
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
  const tabConfig = TAB_CONFIG.find(tab => tab.key === result.type);
  const Icon = tabConfig?.icon || FileText;
  const borderColor = ENTITY_COLORS[result.type];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        'border-2 hover:border-primary/30',
        borderColor
      )}
      onClick={() => onClick?.(result)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar or Icon */}
          <div className="flex-shrink-0">
            {result.avatarUrl ? (
              <Avatar className="w-12 h-12">
                <AvatarImage src={result.avatarUrl} alt={result.title} />
                <AvatarFallback className="bg-muted">
                  <Icon className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                'bg-background border-2',
                tabConfig?.color
              )}>
                <Icon className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">{result.title}</h3>
              {result.metadata?.community && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {result.metadata.community}
                </Badge>
              )}
            </div>
            
            {result.subtitle && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
                {result.subtitle}
              </p>
            )}
            
            {result.description && (
              <p className="text-xs text-muted-foreground/80 line-clamp-1">
                {result.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTabState({ query, tabLabel }: { query: string; tabLabel: string }) {
  return (
    <div className="text-center py-16">
      <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-3">No {tabLabel.toLowerCase()} found</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {query ? (
          <>No {tabLabel.toLowerCase()} found matching <strong>"{query}"</strong></>
        ) : (
          <>Start typing to search for {tabLabel.toLowerCase()}</>
        )}
      </p>
      <div className="text-sm text-muted-foreground">
        <p className="mb-3">Try:</p>
        <ul className="list-none space-y-2">
          <li>• Using different keywords</li>
          <li>• Checking your spelling</li>
          <li>• Using more general terms</li>
          <li>• Searching in other tabs</li>
        </ul>
      </div>
    </div>
  );
}

function LoadingTabState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted rounded animate-pulse w-4/5" />
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const TabbedSearchResults: React.FC<TabbedSearchResultsProps> = ({
  results,
  query,
  isLoading = false,
  className = '',
  onResultClick,
  defaultTab = 'posts', // Default to posts like Reddit
}) => {
  const [activeTab, setActiveTab] = useState<EntityType>(defaultTab);

  // Convert results to unified format and calculate counts
  const allResults: SearchResult[] = [];
  const resultCounts: Record<EntityType, number> = {
    users: 0,
    therapists: 0,
    posts: 0,
    communities: 0,
    worksheets: 0,
    messages: 0,
  };

  Object.entries(results).forEach(([type, items]) => {
    if (items && Array.isArray(items)) {
      resultCounts[type as EntityType] = items.length;
      items.forEach(item => {
        allResults.push(formatSearchResult(item, type as EntityType));
      });
    }
  });

  // Get tabs with results only
  const availableTabs = TAB_CONFIG.filter(tab => resultCounts[tab.key] > 0);
  const totalResults = Object.values(resultCounts).reduce((sum, count) => sum + count, 0);

  // Auto-switch to first available tab if current tab has no results
  React.useEffect(() => {
    if (resultCounts[activeTab] === 0 && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].key);
    }
  }, [results, activeTab, availableTabs]);

  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="mb-6">
          {/* Loading tabs skeleton */}
          <div className="flex gap-1 border-b">
            {TAB_CONFIG.slice(0, 4).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        </div>
        <LoadingTabState />
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-center py-16">
          <Search className="w-20 h-20 text-muted-foreground/30 mx-auto mb-8" />
          <h3 className="text-2xl font-bold mb-4">No results found</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            {query ? (
              <>We couldn't find anything matching <strong>"{query}"</strong></>
            ) : (
              <>Start typing to search across Mentara</>
            )}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-muted-foreground">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon;
              return (
                <div key={tab.key} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Icon className="w-4 h-4" />
                  <span>Search {tab.label.toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeTabResults = allResults.filter(result => result.type === activeTab);
  const activeTabConfig = TAB_CONFIG.find(tab => tab.key === activeTab);

  return (
    <div className={cn('w-full', className)}>
      {/* Search Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
            {query && <> for <strong>"{query}"</strong></>}
          </p>
        </div>
      </div>

      {/* Reddit-style Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EntityType)}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:flex lg:w-auto h-auto p-1 bg-muted/30 rounded-lg">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const count = resultCounts[tab.key];
            const isActive = activeTab === tab.key;
            
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                disabled={count === 0}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                  'hover:bg-background/50',
                  count === 0 && 'opacity-40'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
                {count > 0 && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className="text-xs min-w-[1.25rem] h-5 px-1.5"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        {TAB_CONFIG.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="mt-6">
            {resultCounts[tab.key] === 0 ? (
              <EmptyTabState query={query} tabLabel={tab.label} />
            ) : (
              <div className="space-y-4">
                {/* Tab Header */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <tab.icon className={cn('w-5 h-5', tab.color)} />
                  <h2 className="text-lg font-semibold">{tab.label}</h2>
                  <Badge variant="outline" className="text-xs">
                    {resultCounts[tab.key]} result{resultCounts[tab.key] !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Results Grid */}
                <div className="grid gap-4">
                  {activeTabResults.map(result => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      onClick={onResultClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabbedSearchResults;