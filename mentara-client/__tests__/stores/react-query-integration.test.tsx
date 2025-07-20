import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useTherapistForm from '@/store/therapistform'
import { useModeratorContentStore } from '@/store/moderator'
import { usePreAssessmentStore } from '@/store/pre-assessment'

// Mock API functions
const mockApi = {
  therapists: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
  content: {
    getList: jest.fn(),
    moderate: jest.fn(),
    bulkModerate: jest.fn(),
  },
  assessments: {
    create: jest.fn(),
    getResults: jest.fn(),
  },
}

describe('React Query + Zustand Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  describe('Therapist Form Store + React Query Integration', () => {
    it('syncs form data with React Query cache on submission', async () => {
      const mockTherapistData = {
        id: 'therapist-123',
        firstName: 'Dr. John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        specialties: ['anxiety', 'depression'],
      }

      mockApi.therapists.create.mockResolvedValue(mockTherapistData)

      const TestComponent = () => {
        const form = useTherapistForm()
        const queryClient = useQueryClient()
        
        const mutation = useMutation({
          mutationFn: mockApi.therapists.create,
          onSuccess: (data) => {
            // Update query cache with new data
            queryClient.setQueryData(['therapists', data.id], data)
            // Clear form after successful submission
            form.resetForm()
          },
        })

        return {
          form,
          mutation,
          submitForm: () => mutation.mutate(form.formValues),
        }
      }

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      // Fill form
      result.current.form.updateField('firstName', 'Dr. John')
      result.current.form.updateField('lastName', 'Smith')
      result.current.form.updateField('email', 'john.smith@example.com')

      // Submit form
      result.current.submitForm()

      await waitFor(() => {
        expect(result.current.mutation.isSuccess).toBe(true)
      })

      // Check that query cache was updated
      const cachedData = queryClient.getQueryData(['therapists', 'therapist-123'])
      expect(cachedData).toEqual(mockTherapistData)

      // Check that form was reset
      expect(result.current.form.formValues).toEqual({})
    })

    it('auto-saves form data and syncs with draft queries', async () => {
      const TestComponent = () => {
        const form = useTherapistForm()
        const queryClient = useQueryClient()

        const autoSaveMutation = useMutation({
          mutationFn: (data: any) => Promise.resolve({ ...data, id: 'draft-123' }),
          onSuccess: (data) => {
            queryClient.setQueryData(['therapist-drafts', 'current'], data)
            form.saveFormData()
          },
        })

        React.useEffect(() => {
          if (form.autoSaveEnabled && Object.keys(form.formValues).length > 0) {
            const timer = setTimeout(() => {
              form.setAutoSaving(true)
              autoSaveMutation.mutate(form.formValues)
            }, 1000)
            return () => clearTimeout(timer)
          }
        }, [form.formValues])

        return { form, autoSaveMutation }
      }

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      // Fill form to trigger auto-save
      result.current.form.updateField('firstName', 'Jane')
      result.current.form.updateField('lastName', 'Doe')

      await waitFor(() => {
        expect(result.current.autoSaveMutation.isSuccess).toBe(true)
      })

      // Check that draft was saved to query cache
      const draftData = queryClient.getQueryData(['therapist-drafts', 'current'])
      expect(draftData).toEqual({
        firstName: 'Jane',
        lastName: 'Doe',
        id: 'draft-123',
      })

      // Check that form state was updated
      expect(result.current.form.lastSaved).toBeInstanceOf(Date)
      expect(result.current.form.isAutoSaving).toBe(false)
    })

    it('restores form data from query cache on component mount', async () => {
      const draftData = {
        firstName: 'Restored',
        lastName: 'User',
        email: 'restored@example.com',
        education: {
          degree: 'PhD',
          university: 'Test University',
        },
      }

      // Pre-populate query cache
      queryClient.setQueryData(['therapist-drafts', 'current'], draftData)

      const TestComponent = () => {
        const form = useTherapistForm()
        
        const { data: draftData } = useQuery({
          queryKey: ['therapist-drafts', 'current'],
          queryFn: () => queryClient.getQueryData(['therapist-drafts', 'current']),
        })

        React.useEffect(() => {
          if (draftData && Object.keys(form.formValues).length === 0) {
            // Restore form data from query cache
            Object.entries(draftData).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                  form.updateNestedField(key, nestedKey, nestedValue)
                })
              } else {
                form.updateField(key, value)
              }
            })
          }
        }, [draftData])

        return { form, draftData }
      }

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.form.formValues.firstName).toBe('Restored')
        expect(result.current.form.formValues.lastName).toBe('User')
        expect(result.current.form.formValues.email).toBe('restored@example.com')
        expect(result.current.form.formValues.education?.degree).toBe('PhD')
      })
    })
  })

  describe('Moderator Store + React Query Integration', () => {
    it('syncs content filters with query invalidation', async () => {
      const mockContentList = [
        { id: 'content-1', status: 'pending', title: 'Post 1' },
        { id: 'content-2', status: 'pending', title: 'Post 2' },
      ]

      mockApi.content.getList.mockResolvedValue(mockContentList)

      const TestComponent = () => {
        const store = useModeratorContentStore()
        const queryClient = useQueryClient()

        const { data, refetch } = useQuery({
          queryKey: ['content', 'moderation', store.filters],
          queryFn: () => mockApi.content.getList(store.filters),
        })

        const moderateMutation = useMutation({
          mutationFn: mockApi.content.moderate,
          onSuccess: () => {
            // Invalidate and refetch content list
            queryClient.invalidateQueries({ queryKey: ['content', 'moderation'] })
            // Clear selections after successful moderation
            store.clearSelection()
          },
        })

        return { store, data, moderateMutation }
      }

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockContentList)
      })

      // Update filters - should trigger new query
      act(() => {
        result.current.store.setFilters({ status: 'approved' })
      })

      await waitFor(() => {
        expect(mockApi.content.getList).toHaveBeenLastCalledWith({
          status: 'approved',
          limit: 20,
          offset: 0,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      })
    })

    it('handles bulk moderation with optimistic updates', async () => {
      const mockContentList = [
        { id: 'content-1', status: 'pending', title: 'Post 1' },
        { id: 'content-2', status: 'pending', title: 'Post 2' },
        { id: 'content-3', status: 'pending', title: 'Post 3' },
      ]

      mockApi.content.getList.mockResolvedValue(mockContentList)
      mockApi.content.bulkModerate.mockResolvedValue({ success: true })

      const TestComponent = () => {
        const store = useModeratorContentStore()
        const queryClient = useQueryClient()

        const { data } = useQuery({
          queryKey: ['content', 'moderation', store.filters],
          queryFn: () => mockApi.content.getList(store.filters),
        })

        const bulkModerateMutation = useMutation({
          mutationFn: (params: { ids: string[], action: string }) => 
            mockApi.content.bulkModerate(params),
          onMutate: async (variables) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['content', 'moderation'] })
            
            const previousData = queryClient.getQueryData(['content', 'moderation', store.filters])
            
            if (previousData) {
              queryClient.setQueryData(['content', 'moderation', store.filters], (old: any) =>
                old.map((item: any) => 
                  variables.ids.includes(item.id) 
                    ? { ...item, status: variables.action }
                    : item
                )
              )
            }
            
            return { previousData }
          },
          onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
              queryClient.setQueryData(['content', 'moderation', store.filters], context.previousData)
            }
          },
          onSuccess: () => {
            store.clearSelection()
          },
        })

        return { store, data, bulkModerateMutation }
      }

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockContentList)
      })

      // Select content for bulk moderation
      act(() => {
        result.current.store.setSelectedContentIds(['content-1', 'content-2'])
      })

      // Perform bulk approval
      result.current.bulkModerateMutation.mutate({
        ids: ['content-1', 'content-2'],
        action: 'approved',
      })

      // Check optimistic update
      await waitFor(() => {
        const updatedData = queryClient.getQueryData(['content', 'moderation', result.current.store.filters])
        expect(updatedData).toEqual([
          { id: 'content-1', status: 'approved', title: 'Post 1' },
          { id: 'content-2', status: 'approved', title: 'Post 2' },
          { id: 'content-3', status: 'pending', title: 'Post 3' },
        ])
      })

      await waitFor(() => {
        expect(result.current.bulkModerateMutation.isSuccess).toBe(true)
      })

      // Check that selections were cleared
      expect(result.current.store.selectedContentIds).toEqual([])
    })
  })

  describe('Assessment Store + React Query Integration', () => {
    it('syncs assessment data with query cache and invalidates related queries', async () => {
      const mockAssessmentData = {
        userId: 'user-123',
        responses: { anxiety: 4, depression: 3 },
        score: 7,
        category: 'moderate',
      }

      const mockResults = {
        recommendations: ['therapy', 'exercise'],
        therapistMatches: ['therapist-1', 'therapist-2'],
      }

      mockApi.assessments.create.mockResolvedValue(mockAssessmentData)
      mockApi.assessments.getResults.mockResolvedValue(mockResults)

      const TestComponent = () => {
        const assessmentStore = usePreAssessmentStore()
        const queryClient = useQueryClient()

        const createAssessmentMutation = useMutation({
          mutationFn: mockApi.assessments.create,
          onSuccess: (data) => {
            // Store assessment data in Zustand
            assessmentStore.setAssessmentData(data)
            
            // Cache assessment results
            queryClient.setQueryData(['assessments', data.userId], data)
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['therapist-recommendations'] })
            queryClient.invalidateQueries({ queryKey: ['user-onboarding'] })
          },
        })

        const { data: resultsData } = useQuery({
          queryKey: ['assessment-results', assessmentStore.assessmentData?.userId],
          queryFn: () => mockApi.assessments.getResults(assessmentStore.assessmentData?.userId),
          enabled: !!assessmentStore.assessmentData,
        })

        return { assessmentStore, createAssessmentMutation, resultsData }
      }

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      // Submit assessment
      result.current.createAssessmentMutation.mutate(mockAssessmentData)

      await waitFor(() => {
        expect(result.current.createAssessmentMutation.isSuccess).toBe(true)
      })

      // Check that assessment data was stored in Zustand
      expect(result.current.assessmentStore.assessmentData).toEqual(mockAssessmentData)

      // Check that query cache was updated
      const cachedAssessment = queryClient.getQueryData(['assessments', 'user-123'])
      expect(cachedAssessment).toEqual(mockAssessmentData)

      // Check that results query was triggered
      await waitFor(() => {
        expect(result.current.resultsData).toEqual(mockResults)
      })
    })

    it('clears assessment data and invalidates queries on reset', async () => {
      const TestComponent = () => {
        const assessmentStore = usePreAssessmentStore()
        const queryClient = useQueryClient()

        const clearAssessment = () => {
          assessmentStore.clearAssessmentData()
          queryClient.removeQueries({ queryKey: ['assessment-results'] })
          queryClient.invalidateQueries({ queryKey: ['user-onboarding'] })
        }

        return { assessmentStore, clearAssessment }
      }

      // Pre-populate assessment data
      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })
      result.current.assessmentStore.setAssessmentData({
        userId: 'user-123',
        responses: { anxiety: 4 },
        score: 4,
        category: 'low',
      })

      // Pre-populate query cache
      queryClient.setQueryData(['assessment-results', 'user-123'], { recommendations: ['exercise'] })

      expect(result.current.assessmentStore.assessmentData).toBeTruthy()
      expect(queryClient.getQueryData(['assessment-results', 'user-123'])).toBeTruthy()

      // Clear assessment
      result.current.clearAssessment()

      expect(result.current.assessmentStore.assessmentData).toBeNull()
      expect(queryClient.getQueryData(['assessment-results', 'user-123'])).toBeUndefined()
    })
  })

  describe('Cross-Store Query Dependencies', () => {
    it('manages complex state dependencies across multiple stores and queries', async () => {
      const TestComponent = () => {
        const therapistForm = useTherapistForm()
        const moderatorStore = useModeratorContentStore()
        const assessmentStore = usePreAssessmentStore()
        const queryClient = useQueryClient()

        // Query that depends on multiple store states
        const { data: dashboardData } = useQuery({
          queryKey: [
            'admin-dashboard',
            moderatorStore.filters,
            therapistForm.formValues.id,
            assessmentStore.assessmentData?.userId,
          ],
          queryFn: async () => {
            const [contentStats, therapistStats, assessmentStats] = await Promise.all([
              mockApi.content.getList(moderatorStore.filters),
              therapistForm.formValues.id ? mockApi.therapists.getById(therapistForm.formValues.id) : null,
              assessmentStore.assessmentData ? mockApi.assessments.getResults(assessmentStore.assessmentData.userId) : null,
            ])
            
            return {
              content: contentStats,
              therapist: therapistStats,
              assessment: assessmentStats,
            }
          },
          enabled: !!(moderatorStore.filters || therapistForm.formValues.id || assessmentStore.assessmentData),
        })

        return {
          therapistForm,
          moderatorStore,
          assessmentStore,
          dashboardData,
        }
      }

      mockApi.content.getList.mockResolvedValue([{ id: 'content-1' }])
      mockApi.therapists.getById.mockResolvedValue({ id: 'therapist-1', name: 'Dr. Smith' })
      mockApi.assessments.getResults.mockResolvedValue({ score: 85 })

      const { result } = renderHook(TestComponent, { wrapper: createWrapper() })

      // Update stores to trigger query
      act(() => {
        result.current.moderatorStore.setFilters({ status: 'pending' })
        result.current.therapistForm.updateField('id', 'therapist-1')
        result.current.assessmentStore.setAssessmentData({
          userId: 'user-123',
          responses: {},
          score: 5,
          category: 'moderate',
        })
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual({
          content: [{ id: 'content-1' }],
          therapist: { id: 'therapist-1', name: 'Dr. Smith' },
          assessment: { score: 85 },
        })
      })

      // Clear one store should update query
      act(() => {
        result.current.assessmentStore.clearAssessmentData()
      })

      await waitFor(() => {
        expect(result.current.dashboardData?.assessment).toBeNull()
        expect(result.current.dashboardData?.therapist).toBeTruthy() // Other data should remain
      })
    })
  })
})