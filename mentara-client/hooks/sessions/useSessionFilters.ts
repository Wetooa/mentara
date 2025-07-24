import { useState, useCallback, useMemo } from 'react';
import type { Meeting, MeetingsQueryOptions } from '@/lib/api/services/meetings';

export interface SessionFilters {
  status?: Meeting["status"];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'date' | 'status' | 'therapist';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface UseSessionFiltersReturn {
  filters: SessionFilters;
  setFilters: (filters: Partial<SessionFilters>) => void;
  updateFilter: <K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) => void;
  resetFilters: () => void;
  clearSearch: () => void;
  queryOptions: MeetingsQueryOptions;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  presetFilters: {
    today: () => void;
    thisWeek: () => void;
    thisMonth: () => void;
    lastMonth: () => void;
    upcoming: () => void;
    completed: () => void;
    cancelled: () => void;
    inProgress: () => void;
  };
}

const DEFAULT_FILTERS: SessionFilters = {
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  search: '',
  sortBy: 'date',
  sortOrder: 'desc',
  limit: 20,
  offset: 0,
};

/**
 * Hook for managing session filters with preset options
 */
export function useSessionFilters(initialFilters: Partial<SessionFilters> = {}): UseSessionFiltersReturn {
  const [filters, setFiltersState] = useState<SessionFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const setFilters = useCallback((newFilters: Partial<SessionFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset offset when filters change (except when explicitly setting offset)
      offset: newFilters.offset !== undefined ? newFilters.offset : 0,
    }));
  }, []);

  const updateFilter = useCallback(<K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const clearSearch = useCallback(() => {
    updateFilter('search', '');
  }, [updateFilter]);

  // Convert filters to API query options
  const queryOptions = useMemo<MeetingsQueryOptions>(() => {
    return {
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      limit: filters.limit,
      offset: filters.offset,
    };
  }, [filters]);

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key as keyof SessionFilters];
      if (key === 'search') return value && value.length > 0;
      return value !== defaultValue && value !== undefined && value !== '';
    });
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.search && filters.search.length > 0) count++;
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) count++;
    if (filters.sortOrder !== DEFAULT_FILTERS.sortOrder) count++;
    return count;
  }, [filters]);

  // Helper functions for common date ranges
  const getDateRange = useCallback((days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    
    return {
      dateFrom: pastDate.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
    };
  }, []);

  const getFutureDateRange = useCallback((days: number) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return {
      dateFrom: today.toISOString().split('T')[0],
      dateTo: futureDate.toISOString().split('T')[0],
    };
  }, []);

  // Preset filter functions
  const presetFilters = useMemo(() => ({
    today: () => {
      const today = new Date().toISOString().split('T')[0];
      setFilters({
        dateFrom: today,
        dateTo: today,
        status: undefined,
      });
    },
    
    thisWeek: () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      setFilters({
        dateFrom: startOfWeek.toISOString().split('T')[0],
        dateTo: endOfWeek.toISOString().split('T')[0],
        status: undefined,
      });
    },
    
    thisMonth: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setFilters({
        dateFrom: startOfMonth.toISOString().split('T')[0],
        dateTo: endOfMonth.toISOString().split('T')[0],
        status: undefined,
      });
    },
    
    lastMonth: () => {
      const today = new Date();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      
      setFilters({
        dateFrom: startOfLastMonth.toISOString().split('T')[0],
        dateTo: endOfLastMonth.toISOString().split('T')[0],
        status: undefined,
      });
    },
    
    upcoming: () => {
      setFilters({
        status: 'SCHEDULED',
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: 'date',
        sortOrder: 'asc',
      });
    },
    
    completed: () => {
      setFilters({
        status: 'COMPLETED',
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: 'date',
        sortOrder: 'desc',
      });
    },
    
    cancelled: () => {
      setFilters({
        status: 'CANCELLED',
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: 'date',
        sortOrder: 'desc',
      });
    },
    
    inProgress: () => {
      setFilters({
        status: 'IN_PROGRESS',
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: 'date',
        sortOrder: 'desc',
      });
    },
  }), [setFilters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    clearSearch,
    queryOptions,
    hasActiveFilters,
    activeFilterCount,
    presetFilters,
  };
}

/**
 * Hook for client-side filtering of sessions (for search and additional filtering)
 */
export function useClientSideSessionFilter(sessions: Meeting[], filters: SessionFilters) {
  return useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    let filtered = [...sessions];

    // Search filter (searches in title, therapist name, client name)
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(session => {
        const title = session.title?.toLowerCase() || '';
        const therapistName = `${session.therapist?.user?.firstName || ''} ${session.therapist?.user?.lastName || ''}`.toLowerCase();
        const clientName = `${session.client?.user?.firstName || ''} ${session.client?.user?.lastName || ''}`.toLowerCase();
        
        return title.includes(searchTerm) || 
               therapistName.includes(searchTerm) || 
               clientName.includes(searchTerm);
      });
    }

    // Sort sessions
    if (filters.sortBy && filters.sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.startTime);
            bValue = new Date(b.startTime);
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'therapist':
            aValue = `${a.therapist?.user?.firstName || ''} ${a.therapist?.user?.lastName || ''}`;
            bValue = `${b.therapist?.user?.firstName || ''} ${b.therapist?.user?.lastName || ''}`;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [sessions, filters]);
}