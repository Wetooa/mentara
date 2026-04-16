import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentModerationParams, UserModerationParams, AuditLogParams } from "@/types/api";

// Content moderation store for filters and UI state
export interface ModeratorContentState {
  // Filter preferences
  filters: ContentModerationParams;
  setFilters: (filters: Partial<ContentModerationParams>) => void;
  resetFilters: () => void;
  
  // UI state
  selectedContentIds: string[];
  setSelectedContentIds: (ids: string[]) => void;
  toggleContentSelection: (id: string) => void;
  clearSelection: () => void;
  
  // Preview state
  previewContentId: string | null;
  setPreviewContentId: (id: string | null) => void;
}

export const useModeratorContentStore = create<ModeratorContentState>()(
  persist(
    (set, get) => ({
      // Default filters
      filters: {
        status: 'pending',
        limit: 20,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters, offset: 0 }, // Reset offset when filters change
        })),
      
      resetFilters: () =>
        set({
          filters: {
            status: 'pending',
            limit: 20,
            offset: 0,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          },
        }),
      
      // Selection state (not persisted)
      selectedContentIds: [],
      setSelectedContentIds: (ids) => set({ selectedContentIds: ids }),
      toggleContentSelection: (id) =>
        set((state) => {
          const isSelected = state.selectedContentIds.includes(id);
          return {
            selectedContentIds: isSelected
              ? state.selectedContentIds.filter((selectedId) => selectedId !== id)
              : [...state.selectedContentIds, id],
          };
        }),
      clearSelection: () => set({ selectedContentIds: [] }),
      
      // Preview state (not persisted)
      previewContentId: null,
      setPreviewContentId: (id) => set({ previewContentId: id }),
    }),
    {
      name: "moderator-content-storage",
      partialize: (state) => ({ filters: state.filters }), // Only persist filters
    }
  )
);

// User moderation store for filters and UI state
export interface ModeratorUserState {
  // Filter preferences
  filters: UserModerationParams;
  setFilters: (filters: Partial<UserModerationParams>) => void;
  resetFilters: () => void;
  
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // UI state
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
}

export const useModeratorUserStore = create<ModeratorUserState>()(
  persist(
    (set) => ({
      // Default filters
      filters: {
        status: 'flagged',
        limit: 20,
        offset: 0,
      },
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters, offset: 0 },
        })),
      
      resetFilters: () =>
        set({
          filters: {
            status: 'flagged',
            limit: 20,
            offset: 0,
          },
        }),
      
      // Search state
      searchTerm: "",
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // UI state (not persisted)
      selectedUserId: null,
      setSelectedUserId: (id) => set({ selectedUserId: id }),
    }),
    {
      name: "moderator-user-storage",
      partialize: (state) => ({ 
        filters: state.filters,
        searchTerm: state.searchTerm 
      }),
    }
  )
);

// Audit logs store for filters and search
export interface ModeratorAuditLogsState {
  // Filter preferences
  filters: AuditLogParams;
  setFilters: (filters: Partial<AuditLogParams>) => void;
  resetFilters: () => void;
  
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Date range
  dateRange: {
    startDate: string;
    endDate: string;
  };
  setDateRange: (range: { startDate: string; endDate: string }) => void;
}

export const useModeratorAuditLogsStore = create<ModeratorAuditLogsState>()(
  persist(
    (set) => ({
      // Default filters
      filters: {
        limit: 50,
        offset: 0,
      },
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters, offset: 0 },
        })),
      
      resetFilters: () =>
        set({
          filters: {
            limit: 50,
            offset: 0,
          },
          searchTerm: "",
          dateRange: { startDate: "", endDate: "" },
        }),
      
      // Search state
      searchTerm: "",
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // Date range
      dateRange: { startDate: "", endDate: "" },
      setDateRange: (range) => set({ dateRange: range }),
    }),
    {
      name: "moderator-audit-logs-storage",
    }
  )
);

// General moderator UI state (not persisted)
export interface ModeratorUIState {
  // Dialog states
  actionDialogOpen: boolean;
  setActionDialogOpen: (open: boolean) => void;
  
  // Current action context
  currentAction: {
    type: 'moderate-content' | 'moderate-user' | null;
    targetId: string | null;
    actionType: string | null;
  };
  setCurrentAction: (action: {
    type: 'moderate-content' | 'moderate-user' | null;
    targetId: string | null;
    actionType: string | null;
  }) => void;
  
  // Form data for actions
  actionFormData: {
    reason: string;
    note: string;
    duration?: number;
  };
  setActionFormData: (data: Partial<{
    reason: string;
    note: string;
    duration?: number;
  }>) => void;
  resetActionFormData: () => void;
}

export const useModeratorUIStore = create<ModeratorUIState>()((set) => ({
  // Dialog states
  actionDialogOpen: false,
  setActionDialogOpen: (open) => set({ actionDialogOpen: open }),
  
  // Current action context
  currentAction: {
    type: null,
    targetId: null,
    actionType: null,
  },
  setCurrentAction: (action) => set({ currentAction: action }),
  
  // Form data
  actionFormData: {
    reason: "",
    note: "",
    duration: 7,
  },
  setActionFormData: (data) =>
    set((state) => ({
      actionFormData: { ...state.actionFormData, ...data },
    })),
  resetActionFormData: () =>
    set({
      actionFormData: {
        reason: "",
        note: "",
        duration: 7,
      },
    }),
}));