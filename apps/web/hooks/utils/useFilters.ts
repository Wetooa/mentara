import { useState, useEffect, useCallback } from 'react';
import { TherapistFilters, DEFAULT_FILTERS } from '@/types/filters';

const STORAGE_KEY = 'therapist-filters';

interface UseFiltersOptions {
  persistFilters?: boolean;
  initialFilters?: Partial<TherapistFilters>;
}

export function useFilters(options: UseFiltersOptions = {}) {
  const { persistFilters = true, initialFilters = {} } = options;

  // Initialize filters with defaults, then localStorage, then initial overrides
  const [filters, setFilters] = useState<TherapistFilters>(() => {
    let baseFilters = { ...DEFAULT_FILTERS };

    // Load from localStorage if persistence is enabled
    if (persistFilters && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedFilters = JSON.parse(stored);
          baseFilters = { ...baseFilters, ...parsedFilters };
        }
      } catch (error) {
        console.warn('Failed to load filters from localStorage:', error);
      }
    }

    // Apply initial overrides
    return { ...baseFilters, ...initialFilters };
  });

  // Save to localStorage when filters change
  useEffect(() => {
    if (persistFilters && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.warn('Failed to save filters to localStorage:', error);
      }
    }
  }, [filters, persistFilters]);

  // Update a specific filter
  const updateFilter = useCallback(<K extends keyof TherapistFilters>(
    key: K,
    value: TherapistFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((updates: Partial<TherapistFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);

  // Clear specific filter
  const clearFilter = useCallback(<K extends keyof TherapistFilters>(key: K) => {
    setFilters(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  }, []);

  // Check if filters have been modified from defaults
  const hasActiveFilters = useCallback(() => {
    const defaultFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    
    return (
      JSON.stringify(filters) !== JSON.stringify(defaultFilters)
    );
  }, [filters, initialFilters]);

  // Get active filter count (for display purposes)
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    const defaultFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    
    if (filters.specialties.length > 0) count++;
    if (filters.priceRange.min !== defaultFilters.priceRange.min || 
        filters.priceRange.max !== defaultFilters.priceRange.max) count++;
    if (filters.location && filters.location !== defaultFilters.location) count++;
    if (Object.values(filters.availability).some(Boolean)) count++;
    if (filters.languages.length > 0) count++;
    if (filters.experienceLevel.min !== defaultFilters.experienceLevel.min || 
        filters.experienceLevel.max !== defaultFilters.experienceLevel.max) count++;
    if (filters.rating > 0) count++;
    
    return count;
  }, [filters, initialFilters]);

  // Convert filters to API query parameters
  const toQueryParams = useCallback(() => {
    const params: Record<string, any> = {};

    if (filters.specialties.length > 0) {
      params.specialties = filters.specialties;
    }
    
    if (filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min || 
        filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max) {
      params.minPrice = filters.priceRange.min;
      params.maxPrice = filters.priceRange.max;
    }

    if (filters.location) {
      params.location = filters.location;
    }

    if (Object.values(filters.availability).some(Boolean)) {
      params.availability = filters.availability;
    }


    if (filters.languages.length > 0) {
      params.languages = filters.languages;
    }

    if (filters.experienceLevel.min !== DEFAULT_FILTERS.experienceLevel.min || 
        filters.experienceLevel.max !== DEFAULT_FILTERS.experienceLevel.max) {
      params.minExperience = filters.experienceLevel.min;
      params.maxExperience = filters.experienceLevel.max;
    }

    if (filters.rating > 0) {
      params.minRating = filters.rating;
    }

    params.sortBy = filters.sortBy;
    params.sortOrder = filters.sortOrder;

    return params;
  }, [filters]);

  // Generate filter summary for display
  const getFilterSummary = useCallback(() => {
    const summary: string[] = [];

    if (filters.specialties.length > 0) {
      summary.push(`${filters.specialties.length} specialties`);
    }

    if (filters.location) {
      summary.push(filters.location);
    }

    if (filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min || 
        filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max) {
      summary.push(`$${filters.priceRange.min}-${filters.priceRange.max}`);
    }

    const availabilityCount = Object.values(filters.availability).filter(Boolean).length;
    if (availabilityCount > 0) {
      summary.push(`${availabilityCount} time slots`);
    }


    if (filters.languages.length > 0) {
      summary.push(`${filters.languages.length} languages`);
    }

    if (filters.experienceLevel.min !== DEFAULT_FILTERS.experienceLevel.min || 
        filters.experienceLevel.max !== DEFAULT_FILTERS.experienceLevel.max) {
      summary.push(`${filters.experienceLevel.min}-${filters.experienceLevel.max} years experience`);
    }

    if (filters.rating > 0) {
      summary.push(`${filters.rating}+ stars`);
    }

    return summary;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: getActiveFilterCount(),
    toQueryParams,
    getFilterSummary,
  };
}