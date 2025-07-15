/**
 * Brave Search Service for External People Lookup
 * This service integrates with the Brave Search MCP to find people externally
 */

import { ExternalSearchResult } from '@/hooks/useGlobalSearch';

export interface BraveSearchOptions {
  maxResults?: number;
  includeLocations?: boolean;
  filterProfessions?: string[];
  searchType?: 'people' | 'therapists';
}

export interface BraveSearchResult {
  title: string;
  description: string;
  url: string;
  snippet?: string;
  location?: string;
  meta?: {
    type?: string;
    source?: string;
  };
}

export class BraveSearchService {
  private readonly cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
  private readonly cache = new Map<string, { data: ExternalSearchResult[]; timestamp: number }>();

  /**
   * Search for people using Brave Search MCP
   */
  async searchPeople(
    query: string,
    options: BraveSearchOptions = {}
  ): Promise<ExternalSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = this.generateCacheKey(query, options);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Enhanced query for people search
      const enhancedQuery = this.enhanceQueryForPeople(query, options);
      
      // Call Brave Search MCP
      const braveResults = await this.callBraveSearchMCP(enhancedQuery, options);
      
      // Process and normalize results
      const normalizedResults = this.processResults(braveResults, options);
      
      // Cache the results
      this.setCachedResult(cacheKey, normalizedResults);
      
      return normalizedResults;
      
    } catch (error) {
      console.error('Brave Search failed:', error);
      throw new Error('External search temporarily unavailable');
    }
  }

  /**
   * Search specifically for therapists using Brave Search
   */
  async searchTherapists(
    query: string,
    options: BraveSearchOptions = {}
  ): Promise<ExternalSearchResult[]> {
    const therapistOptions = {
      ...options,
      searchType: 'therapists' as const,
      filterProfessions: ['therapist', 'psychologist', 'counselor', 'psychiatrist', ...(options.filterProfessions || [])]
    };

    return this.searchPeople(query, therapistOptions);
  }

  /**
   * Enhance search query for better people search results
   */
  private enhanceQueryForPeople(query: string, options: BraveSearchOptions): string {
    let enhancedQuery = query.trim();
    
    // Add people-specific terms
    if (options.searchType === 'therapists') {
      enhancedQuery += ' therapist psychologist counselor mental health professional';
    } else {
      enhancedQuery += ' person profile contact LinkedIn professional';
    }

    // Add location context if requested
    if (options.includeLocations) {
      enhancedQuery += ' location contact address';
    }

    return enhancedQuery;
  }

  /**
   * Call the Brave Search MCP
   * This is where the actual MCP integration happens
   */
  private async callBraveSearchMCP(
    query: string,
    options: BraveSearchOptions
  ): Promise<BraveSearchResult[]> {
    // This is a placeholder for the actual MCP call
    // In a real implementation, this would use the mcp__brave-search__brave_web_search tool
    // through Claude Code's MCP integration
    
    console.log(`[BraveSearchService] Searching for: ${query}`);
    
    // For now, return mock data that simulates Brave Search results
    return this.generateMockResults(query, options);
  }

  /**
   * Generate mock Brave Search results for testing
   * This will be replaced with actual MCP calls in production
   */
  private generateMockResults(query: string, options: BraveSearchOptions): BraveSearchResult[] {
    const baseQuery = query.replace(/\s+(therapist|psychologist|counselor|person|profile|contact|linkedin|professional|location|address)/gi, '').trim();
    
    const mockResults: BraveSearchResult[] = [];
    
    // Add professional profile results
    mockResults.push({
      title: `${baseQuery} - Professional Profile | LinkedIn`,
      description: `View ${baseQuery}'s professional profile on LinkedIn. See their work experience, education, and professional connections.`,
      url: `https://linkedin.com/in/${baseQuery.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Professional profile for ${baseQuery} with extensive experience in their field.`,
      location: options.includeLocations ? 'New York, NY' : undefined,
      meta: {
        type: 'professional',
        source: 'linkedin'
      }
    });

    // Add therapy-specific results if searching for therapists
    if (options.searchType === 'therapists') {
      mockResults.push({
        title: `Dr. ${baseQuery} - Licensed Therapist`,
        description: `Licensed mental health professional specializing in anxiety, depression, and relationship counseling. Schedule an appointment today.`,
        url: `https://psychologytoday.com/therapists/${baseQuery.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Dr. ${baseQuery} is a licensed clinical psychologist with over 10 years of experience helping individuals and couples.`,
        location: options.includeLocations ? 'California, CA' : undefined,
        meta: {
          type: 'therapist',
          source: 'directory'
        }
      });

      mockResults.push({
        title: `${baseQuery} Therapy Services - Mental Health Center`,
        description: `Comprehensive mental health services provided by ${baseQuery}. Individual therapy, group therapy, and specialized treatments available.`,
        url: `https://example-therapy-center.com/therapists/${baseQuery.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `${baseQuery} provides evidence-based therapy services for adults and adolescents.`,
        location: options.includeLocations ? 'Texas, TX' : undefined,
        meta: {
          type: 'practice',
          source: 'directory'
        }
      });
    }

    return mockResults.slice(0, options.maxResults || 5);
  }

  /**
   * Process and normalize Brave Search results
   */
  private processResults(
    braveResults: BraveSearchResult[],
    options: BraveSearchOptions
  ): ExternalSearchResult[] {
    return braveResults.map(result => ({
      id: this.generateResultId(result),
      name: this.extractNameFromTitle(result.title),
      description: result.description || result.snippet || '',
      url: result.url,
      source: 'brave' as const,
      type: this.inferResultType(result),
      location: result.location,
      profession: this.extractProfession(result.description || result.snippet || ''),
      relevanceScore: this.calculateRelevanceScore(result, options)
    }));
  }

  /**
   * Extract person name from search result title
   */
  private extractNameFromTitle(title: string): string {
    // Try to extract name from common title patterns
    const patterns = [
      /^([^-|]+)(?:\s*[-|])/,  // "John Doe - Title" or "John Doe | Title"
      /^Dr\.\s+([^-|]+)(?:\s*[-|])/,  // "Dr. John Doe - Title"
      /^([^-|]+)(?:\s*[-|])/,  // General pattern
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Fallback: return first part of title
    return title.split(/[-|]/)[0].trim();
  }

  /**
   * Infer result type from content
   */
  private inferResultType(result: BraveSearchResult): 'person' | 'professional' | 'organization' {
    const content = `${result.title} ${result.description || ''} ${result.snippet || ''}`.toLowerCase();
    
    if (content.includes('therapist') || content.includes('psychologist') || 
        content.includes('counselor') || content.includes('psychiatrist')) {
      return 'professional';
    }
    
    if (content.includes('company') || content.includes('organization') || 
        content.includes('clinic') || content.includes('practice') || 
        content.includes('center')) {
      return 'organization';
    }
    
    return 'person';
  }

  /**
   * Extract profession from text
   */
  private extractProfession(text: string): string | undefined {
    const professions = [
      'therapist', 'psychologist', 'counselor', 'psychiatrist',
      'social worker', 'psychotherapist', 'marriage counselor',
      'family therapist', 'clinical psychologist', 'licensed professional counselor'
    ];
    
    const lowerText = text.toLowerCase();
    for (const profession of professions) {
      if (lowerText.includes(profession)) {
        return profession;
      }
    }
    
    return undefined;
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(result: BraveSearchResult): number {
    let score = 0.5; // Base score
    
    const content = `${result.title} ${result.description || ''} ${result.snippet || ''}`.toLowerCase();
    
    // Boost for mental health professionals
    if (content.includes('therapist') || content.includes('psychologist')) {
      score += 0.3;
    }
    
    // Boost for having location information
    if (result.location) {
      score += 0.1;
    }
    
    // Boost for having contact information
    if (content.includes('contact') || content.includes('phone') || content.includes('email')) {
      score += 0.1;
    }
    
    // Boost for LinkedIn profiles
    if (result.url.includes('linkedin.com')) {
      score += 0.2;
    }
    
    // Boost for professional directories
    if (result.url.includes('psychologytoday.com') || result.url.includes('therapistfinder.com')) {
      score += 0.25;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Generate unique ID for search result
   */
  private generateResultId(): string {
    return `brave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate cache key for search results
   */
  private generateCacheKey(query: string, options: BraveSearchOptions): string {
    const optionsStr = JSON.stringify(options);
    return `brave_search:${query}:${optionsStr}`;
  }

  /**
   * Get cached search results if they exist and are not expired
   */
  private getCachedResult(cacheKey: string): ExternalSearchResult[] | null {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiryMs) {
      return cached.data;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Cache search results
   */
  private setCachedResult(cacheKey: string, results: ExternalSearchResult[]): void {
    this.cache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const braveSearchService = new BraveSearchService();