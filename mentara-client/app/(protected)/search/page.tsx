'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OmniSearchBar, type EntityType, type OmniSearchFilters } from '@/components/search/OmniSearchBar';
import { OmniSearchResults } from '@/components/search/OmniSearchResults';
import { useOmniSearch, useTrendingSearches, useSearchSuggestions } from '@/components/search/hooks/useOmniSearch';
import { Badge } from '@/components/ui/badge';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial query from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialTypes = searchParams.get('types')?.split(',') as EntityType[] || [];
  
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<OmniSearchFilters>({
    entityTypes: initialTypes.length > 0 ? initialTypes : ['users', 'therapists', 'posts', 'communities', 'worksheets', 'messages'],
    showFilters: false,
  });

  // Search hooks
  const { results, isLoading, isError, error } = useOmniSearch(query, filters.entityTypes);
  const { data: trendingSearches } = useTrendingSearches();
  const { data: suggestions } = useSearchSuggestions(query, query.length >= 2 && query.length <= 3);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    if (filters.entityTypes.length > 0 && filters.entityTypes.length < 6) {
      params.set('types', filters.entityTypes.join(','));
    }
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    window.history.replaceState({}, '', newUrl);
  }, [query, filters.entityTypes]);

  // Handle search
  const handleSearch = (newQuery: string, newFilters: OmniSearchFilters) => {
    setQuery(newQuery);
    setFilters(newFilters);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setFilters({
      entityTypes: ['users', 'therapists', 'posts', 'communities', 'worksheets', 'messages'],
      showFilters: false,
    });
  };

  // Handle result click
  const handleResultClick = (result: { url?: string }) => {
    if (result.url) {
      router.push(result.url);
    }
  };

  // Handle trending search click
  const handleTrendingClick = (trendingQuery: string) => {
    setQuery(trendingQuery);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex-1">
              <OmniSearchBar
                onSearch={handleSearch}
                onClear={handleClear}
                placeholder="Search everything in Mentara..."
                autoFocus={!initialQuery}
                defaultFilters={filters}
                isLoading={isLoading}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Error State */}
        {isError && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-destructive mb-2">Search Error</h3>
                <p className="text-muted-foreground mb-4">
                  {error?.message || 'There was an error performing your search. Please try again.'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Retry Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {hasQuery && (
          <OmniSearchResults
            results={results || {}}
            query={query}
            isLoading={isLoading}
            onResultClick={handleResultClick}
            className="mb-8"
          />
        )}

        {/* Search Suggestions (only show for short queries) */}
        {query.length >= 2 && query.length <= 3 && suggestions && suggestions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Did you mean?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State with Trending Searches */}
        {!hasQuery && (
          <div className="space-y-6">
            {/* Welcome */}
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Search Mentara</h1>
                <p className="text-muted-foreground mb-6">
                  Find users, therapists, posts, communities, worksheets, and messages all in one place.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50">Users</Badge>
                    <span>Find community members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50">Therapists</Badge>
                    <span>Discover professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50">Posts</Badge>
                    <span>Browse discussions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-50">Communities</Badge>
                    <span>Join support groups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-pink-50">Worksheets</Badge>
                    <span>Access therapy tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-cyan-50">Messages</Badge>
                    <span>Search conversations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Searches */}
            {trendingSearches && trendingSearches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trending Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.slice(0, 10).map((trending, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTrendingClick(trending)}
                        className="text-sm h-auto p-2 font-normal"
                      >
                        <Search className="w-3 h-3 mr-2" />
                        {trending}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setQuery('anxiety')}
                  >
                    <span className="font-medium">Find Anxiety Support</span>
                    <span className="text-sm text-muted-foreground">Search for anxiety-related content</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setQuery('therapist near me')}
                  >
                    <span className="font-medium">Find Local Therapists</span>
                    <span className="text-sm text-muted-foreground">Discover therapists in your area</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setFilters({...filters, entityTypes: ['communities']})}
                  >
                    <span className="font-medium">Browse Communities</span>
                    <span className="text-sm text-muted-foreground">Find support groups</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setFilters({...filters, entityTypes: ['worksheets']})}
                  >
                    <span className="font-medium">Therapy Resources</span>
                    <span className="text-sm text-muted-foreground">Access worksheets and tools</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}