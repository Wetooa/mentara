import { act, renderHook } from '@testing-library/react'
import { 
  useModeratorContentStore, 
  useModeratorUIStore, 
  useModeratorUserStore,
  useModeratorAuditLogsStore
} from '@/store/moderator'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Moderator Store Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('useModeratorContentStore', () => {
    beforeEach(() => {
      act(() => {
        useModeratorContentStore.getState().resetFilters()
        useModeratorContentStore.getState().clearSelection()
        useModeratorContentStore.getState().setPreviewContentId(null)
      })
    })

    describe('Initial State', () => {
      it('initializes with default filter values', () => {
        const { result } = renderHook(() => useModeratorContentStore())
        
        expect(result.current.filters).toEqual({
          status: 'pending',
          limit: 20,
          offset: 0,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        expect(result.current.selectedContentIds).toEqual([])
        expect(result.current.previewContentId).toBeNull()
      })
    })

    describe('Filter Management', () => {
      it('updates filters while preserving existing ones', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        act(() => {
          result.current.setFilters({ status: 'approved', limit: 50 })
        })

        expect(result.current.filters).toEqual({
          status: 'approved',
          limit: 50,
          offset: 0, // Reset when filters change
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      })

      it('resets offset when filters change', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        // First set offset to non-zero via direct state update
        act(() => {
          useModeratorContentStore.setState((state) => ({
            filters: { ...state.filters, offset: 40 }
          }))
        })

        expect(result.current.filters.offset).toBe(40)

        // Then change another filter - offset should reset
        act(() => {
          result.current.setFilters({ status: 'rejected' })
        })

        expect(result.current.filters.offset).toBe(0) // Should be reset
        expect(result.current.filters.status).toBe('rejected')
      })

      it('resets filters to default values', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        // Modify filters first
        act(() => {
          result.current.setFilters({
            status: 'approved',
            limit: 100,
            sortBy: 'updatedAt',
            sortOrder: 'asc',
          })
        })

        expect(result.current.filters.status).toBe('approved')

        act(() => {
          result.current.resetFilters()
        })

        expect(result.current.filters).toEqual({
          status: 'pending',
          limit: 20,
          offset: 0,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      })

      it('handles partial filter updates', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        act(() => {
          result.current.setFilters({ sortBy: 'title' })
        })

        expect(result.current.filters).toEqual({
          status: 'pending',
          limit: 20,
          offset: 0,
          sortBy: 'title',
          sortOrder: 'desc',
        })
      })
    })

    describe('Content Selection', () => {
      it('sets selected content IDs', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        const contentIds = ['content-1', 'content-2', 'content-3']

        act(() => {
          result.current.setSelectedContentIds(contentIds)
        })

        expect(result.current.selectedContentIds).toEqual(contentIds)
      })

      it('toggles individual content selection', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        // Start with some selected content
        act(() => {
          result.current.setSelectedContentIds(['content-1', 'content-3'])
        })

        // Toggle content-2 (should add)
        act(() => {
          result.current.toggleContentSelection('content-2')
        })

        expect(result.current.selectedContentIds).toEqual(['content-1', 'content-3', 'content-2'])

        // Toggle content-1 (should remove)
        act(() => {
          result.current.toggleContentSelection('content-1')
        })

        expect(result.current.selectedContentIds).toEqual(['content-3', 'content-2'])
      })

      it('handles toggling non-existent content ID', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        act(() => {
          result.current.toggleContentSelection('new-content')
        })

        expect(result.current.selectedContentIds).toEqual(['new-content'])
      })

      it('clears all selected content', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        // Set some selections first
        act(() => {
          result.current.setSelectedContentIds(['content-1', 'content-2', 'content-3'])
        })

        expect(result.current.selectedContentIds).toHaveLength(3)

        act(() => {
          result.current.clearSelection()
        })

        expect(result.current.selectedContentIds).toEqual([])
      })
    })

    describe('Content Preview', () => {
      it('sets preview content ID', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        act(() => {
          result.current.setPreviewContentId('content-123')
        })

        expect(result.current.previewContentId).toBe('content-123')
      })

      it('clears preview content ID', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        // Set preview first
        act(() => {
          result.current.setPreviewContentId('content-123')
        })

        expect(result.current.previewContentId).toBe('content-123')

        act(() => {
          result.current.setPreviewContentId(null)
        })

        expect(result.current.previewContentId).toBeNull()
      })
    })

    describe('Persistence', () => {
      it('persists only filters to localStorage', () => {
        const { result } = renderHook(() => useModeratorContentStore())

        act(() => {
          result.current.setFilters({ status: 'approved', limit: 50 })
          result.current.setSelectedContentIds(['content-1', 'content-2'])
          result.current.setPreviewContentId('preview-content')
        })

        // Trigger persistence by getting stored value
        const stored = localStorage.getItem('moderator-content-storage')
        
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed.state.filters).toEqual({
            status: 'approved',
            limit: 50,
            offset: 0,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          })
          
          // Selection and preview should not be persisted
          expect(parsed.state.selectedContentIds).toBeUndefined()
          expect(parsed.state.previewContentId).toBeUndefined()
        }
      })
    })
  })

  describe('useModeratorUIStore', () => {
    beforeEach(() => {
      act(() => {
        useModeratorUIStore.setState({
          actionDialogOpen: false,
          currentAction: {
            type: null,
            targetId: null,
            actionType: null,
          },
          actionFormData: {
            reason: "",
            note: "",
            duration: 7,
          },
        })
      })
    })

    it('initializes with default UI state', () => {
      const { result } = renderHook(() => useModeratorUIStore())
      
      expect(result.current.actionDialogOpen).toBe(false)
      expect(result.current.currentAction).toEqual({
        type: null,
        targetId: null,
        actionType: null,
      })
      expect(result.current.actionFormData).toEqual({
        reason: "",
        note: "",
        duration: 7,
      })
    })

    it('opens and closes action dialog', () => {
      const { result } = renderHook(() => useModeratorUIStore())

      act(() => {
        result.current.setActionDialogOpen(true)
      })

      expect(result.current.actionDialogOpen).toBe(true)

      act(() => {
        result.current.setActionDialogOpen(false)
      })

      expect(result.current.actionDialogOpen).toBe(false)
    })

    it('sets current action context', () => {
      const { result } = renderHook(() => useModeratorUIStore())

      const action = {
        type: 'moderate-content' as const,
        targetId: 'content-123',
        actionType: 'approve',
      }

      act(() => {
        result.current.setCurrentAction(action)
      })

      expect(result.current.currentAction).toEqual(action)
    })

    it('updates action form data', () => {
      const { result } = renderHook(() => useModeratorUIStore())

      act(() => {
        result.current.setActionFormData({
          reason: 'Spam content',
          note: 'Contains promotional links',
        })
      })

      expect(result.current.actionFormData).toEqual({
        reason: 'Spam content',
        note: 'Contains promotional links',
        duration: 7, // Should preserve existing duration
      })
    })

    it('resets action form data', () => {
      const { result } = renderHook(() => useModeratorUIStore())

      // Set some form data first
      act(() => {
        result.current.setActionFormData({
          reason: 'Test reason',
          note: 'Test note',
          duration: 30,
        })
      })

      expect(result.current.actionFormData.reason).toBe('Test reason')

      act(() => {
        result.current.resetActionFormData()
      })

      expect(result.current.actionFormData).toEqual({
        reason: "",
        note: "",
        duration: 7,
      })
    })
  })

  describe('useModeratorUserStore', () => {
    beforeEach(() => {
      act(() => {
        useModeratorUserStore.getState().resetFilters()
      })
    })

    it('initializes with default user management state', () => {
      const { result } = renderHook(() => useModeratorUserStore())
      
      expect(result.current.filters).toEqual({
        status: 'flagged',
        limit: 20,
        offset: 0,
      })
      expect(result.current.searchTerm).toBe('')
      expect(result.current.selectedUserId).toBeNull()
    })

    it('updates user filters', () => {
      const { result } = renderHook(() => useModeratorUserStore())

      act(() => {
        result.current.setFilters({ status: 'active', limit: 50 })
      })

      expect(result.current.filters).toEqual({
        status: 'active',
        limit: 50,
        offset: 0,
      })
    })

    it('manages search term', () => {
      const { result } = renderHook(() => useModeratorUserStore())

      act(() => {
        result.current.setSearchTerm('john doe')
      })

      expect(result.current.searchTerm).toBe('john doe')
    })

    it('manages selected user', () => {
      const { result } = renderHook(() => useModeratorUserStore())

      act(() => {
        result.current.setSelectedUserId('user-123')
      })

      expect(result.current.selectedUserId).toBe('user-123')

      act(() => {
        result.current.setSelectedUserId(null)
      })

      expect(result.current.selectedUserId).toBeNull()
    })

    it('resets filters to defaults', () => {
      const { result } = renderHook(() => useModeratorUserStore())

      // Modify filters first
      act(() => {
        result.current.setFilters({ status: 'banned', limit: 100 })
        result.current.setSearchTerm('test search')
      })

      expect(result.current.filters.status).toBe('banned')
      expect(result.current.searchTerm).toBe('test search')

      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual({
        status: 'flagged',
        limit: 20,
        offset: 0,
      })
      // Note: resetFilters in user store doesn't reset searchTerm, only in audit store
      expect(result.current.searchTerm).toBe('test search') // Should remain unchanged
    })
  })

  describe('useModeratorAuditLogsStore', () => {
    beforeEach(() => {
      act(() => {
        useModeratorAuditLogsStore.getState().resetFilters()
      })
    })

    it('initializes with default audit log state', () => {
      const { result } = renderHook(() => useModeratorAuditLogsStore())
      
      expect(result.current.filters).toEqual({
        limit: 50,
        offset: 0,
      })
      expect(result.current.searchTerm).toBe('')
      expect(result.current.dateRange).toEqual({
        startDate: '',
        endDate: '',
      })
    })

    it('updates log filters', () => {
      const { result } = renderHook(() => useModeratorAuditLogsStore())

      act(() => {
        result.current.setFilters({
          limit: 100,
          offset: 50,
        })
      })

      expect(result.current.filters).toEqual({
        limit: 100,
        offset: 0, // Should reset offset
      })
    })

    it('manages log search term', () => {
      const { result } = renderHook(() => useModeratorAuditLogsStore())

      act(() => {
        result.current.setSearchTerm('content moderation')
      })

      expect(result.current.searchTerm).toBe('content moderation')
    })

    it('manages date range', () => {
      const { result } = renderHook(() => useModeratorAuditLogsStore())

      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }

      act(() => {
        result.current.setDateRange(dateRange)
      })

      expect(result.current.dateRange).toEqual(dateRange)
    })

    it('resets log filters to defaults', () => {
      const { result } = renderHook(() => useModeratorAuditLogsStore())

      // Set some data first
      act(() => {
        result.current.setFilters({ limit: 100 })
        result.current.setSearchTerm('test search')
        result.current.setDateRange({ startDate: '2024-01-01', endDate: '2024-01-31' })
      })

      expect(result.current.filters.limit).toBe(100)
      expect(result.current.searchTerm).toBe('test search')

      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual({
        limit: 50,
        offset: 0,
      })
      expect(result.current.searchTerm).toBe('')
      expect(result.current.dateRange).toEqual({
        startDate: '',
        endDate: '',
      })
    })
  })

  describe('Store Integration', () => {
    it('maintains independent state between different stores', () => {
      const { result: contentResult } = renderHook(() => useModeratorContentStore())
      const { result: uiResult } = renderHook(() => useModeratorUIStore())
      const { result: userResult } = renderHook(() => useModeratorUserStore())

      act(() => {
        contentResult.current.setFilters({ status: 'approved' })
        uiResult.current.setActionDialogOpen(true)
        userResult.current.setSearchTerm('test search')
      })

      expect(contentResult.current.filters.status).toBe('approved')
      expect(uiResult.current.actionDialogOpen).toBe(true)
      expect(userResult.current.searchTerm).toBe('test search')

      // Reset one store shouldn't affect others
      act(() => {
        contentResult.current.resetFilters()
      })

      expect(contentResult.current.filters.status).toBe('pending')
      expect(uiResult.current.actionDialogOpen).toBe(true) // Should remain unchanged
      expect(userResult.current.searchTerm).toBe('test search') // Should remain unchanged
    })
  })

  describe('Complex Workflows', () => {
    it('handles bulk content moderation workflow', () => {
      const { result: contentResult } = renderHook(() => useModeratorContentStore())
      const { result: uiResult } = renderHook(() => useModeratorUIStore())

      act(() => {
        // Set filters to pending content
        contentResult.current.setFilters({ status: 'pending', limit: 100 })
        
        // Select multiple content items
        contentResult.current.setSelectedContentIds(['content-1', 'content-2', 'content-3'])
        
        // Open action dialog
        uiResult.current.setActionDialogOpen(true)
        uiResult.current.setCurrentAction({
          type: 'moderate-content',
          targetId: 'bulk',
          actionType: 'approve',
        })
        
        // Preview first item
        contentResult.current.setPreviewContentId('content-1')
      })

      expect(contentResult.current.filters.status).toBe('pending')
      expect(contentResult.current.selectedContentIds).toHaveLength(3)
      expect(uiResult.current.actionDialogOpen).toBe(true)
      expect(contentResult.current.previewContentId).toBe('content-1')

      act(() => {
        // After bulk approval, clear selections and close dialog
        contentResult.current.clearSelection()
        uiResult.current.setActionDialogOpen(false)
        contentResult.current.setPreviewContentId(null)
      })

      expect(contentResult.current.selectedContentIds).toHaveLength(0)
      expect(uiResult.current.actionDialogOpen).toBe(false)
      expect(contentResult.current.previewContentId).toBeNull()
    })

    it('handles user management workflow', () => {
      const { result: userResult } = renderHook(() => useModeratorUserStore())
      const { result: auditResult } = renderHook(() => useModeratorAuditLogsStore())

      act(() => {
        // Search for specific users
        userResult.current.setSearchTerm('suspicious activity')
        userResult.current.setFilters({ status: 'flagged' })
        
        // Select user for review
        userResult.current.setSelectedUserId('user-1')
        
        // Check audit logs with search
        auditResult.current.setSearchTerm('user-1')
        auditResult.current.setDateRange({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      })

      expect(userResult.current.searchTerm).toBe('suspicious activity')
      expect(userResult.current.filters.status).toBe('flagged')
      expect(userResult.current.selectedUserId).toBe('user-1')
      expect(auditResult.current.searchTerm).toBe('user-1')
      expect(auditResult.current.dateRange.startDate).toBe('2024-01-01')
    })
  })
})