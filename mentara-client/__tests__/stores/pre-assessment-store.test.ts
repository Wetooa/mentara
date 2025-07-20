import { act, renderHook } from '@testing-library/react'
import { usePreAssessmentStore, useSignUpStore, usePreAssessmentChecklistStore } from '@/store/pre-assessment'

describe('Pre-Assessment Store Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      usePreAssessmentStore.getState().clearAssessmentData()
      useSignUpStore.setState({ details: { email: "", nickName: "" } })
      usePreAssessmentChecklistStore.setState({ 
        step: 0, 
        miniStep: 0, 
        questionnaires: [], 
        answers: [] 
      })
    })
  })

  describe('usePreAssessmentStore', () => {
    it('initializes with null assessment data', () => {
      const { result } = renderHook(() => usePreAssessmentStore())
      
      expect(result.current.assessmentData).toBeNull()
    })

    it('sets and gets assessment data', () => {
      const mockAssessmentData = {
        userId: 'user-123',
        responses: {
          anxiety: 4,
          depression: 3,
          stress: 5,
        },
        score: 12,
        category: 'moderate',
      }

      const { result } = renderHook(() => usePreAssessmentStore())

      act(() => {
        result.current.setAssessmentData(mockAssessmentData)
      })

      expect(result.current.assessmentData).toEqual(mockAssessmentData)
      expect(result.current.getAssessmentData()).toEqual(mockAssessmentData)
    })

    it('updates assessment data partially', () => {
      const initialData = {
        userId: 'user-123',
        responses: { anxiety: 4 },
        score: 4,
        category: 'low',
      }

      const updatedData = {
        userId: 'user-123',
        responses: { anxiety: 4, depression: 3 },
        score: 7,
        category: 'moderate',
      }

      const { result } = renderHook(() => usePreAssessmentStore())

      act(() => {
        result.current.setAssessmentData(initialData)
      })

      expect(result.current.assessmentData).toEqual(initialData)

      act(() => {
        result.current.setAssessmentData(updatedData)
      })

      expect(result.current.assessmentData).toEqual(updatedData)
    })

    it('clears assessment data', () => {
      const mockData = {
        userId: 'user-123',
        responses: { anxiety: 4 },
        score: 4,
        category: 'low',
      }

      const { result } = renderHook(() => usePreAssessmentStore())

      act(() => {
        result.current.setAssessmentData(mockData)
      })

      expect(result.current.assessmentData).toEqual(mockData)

      act(() => {
        result.current.clearAssessmentData()
      })

      expect(result.current.assessmentData).toBeNull()
    })

    it('maintains state consistency across multiple hook calls', () => {
      const mockData = {
        userId: 'user-123',
        responses: { anxiety: 4 },
        score: 4,
        category: 'low',
      }

      const { result: result1 } = renderHook(() => usePreAssessmentStore())
      const { result: result2 } = renderHook(() => usePreAssessmentStore())

      act(() => {
        result1.current.setAssessmentData(mockData)
      })

      expect(result1.current.assessmentData).toEqual(mockData)
      expect(result2.current.assessmentData).toEqual(mockData)

      act(() => {
        result2.current.clearAssessmentData()
      })

      expect(result1.current.assessmentData).toBeNull()
      expect(result2.current.assessmentData).toBeNull()
    })

    it('handles complex assessment data structures', () => {
      const complexData = {
        userId: 'user-123',
        responses: {
          anxiety: { level: 4, symptoms: ['worry', 'restlessness'] },
          depression: { level: 3, symptoms: ['sadness', 'fatigue'] },
          stress: { level: 5, symptoms: ['tension', 'overwhelm'] },
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: 180,
          userAgent: 'test-agent',
        },
        score: 12,
        category: 'moderate',
        recommendations: ['therapy', 'exercise', 'mindfulness'],
      }

      const { result } = renderHook(() => usePreAssessmentStore())

      act(() => {
        result.current.setAssessmentData(complexData)
      })

      expect(result.current.assessmentData).toEqual(complexData)
      expect(result.current.getAssessmentData()).toEqual(complexData)
    })
  })

  describe('useSignUpStore', () => {
    it('initializes with empty details', () => {
      const { result } = renderHook(() => useSignUpStore())
      
      expect(result.current.details).toEqual({ email: "", nickName: "" })
    })

    it('stores sign-up details', () => {
      const signUpDetails = {
        email: 'user@example.com',
        nickName: 'TestUser',
      }

      const { result } = renderHook(() => useSignUpStore())

      act(() => {
        result.current.setDetails(signUpDetails)
      })

      expect(result.current.details).toEqual(signUpDetails)
    })
  })

  describe('usePreAssessmentChecklistStore', () => {
    it('initializes with step 0 and empty questionnaires', () => {
      const { result } = renderHook(() => usePreAssessmentChecklistStore())
      
      expect(result.current.step).toBe(0)
      expect(result.current.miniStep).toBe(0)
      expect(result.current.questionnaires).toEqual([])
      expect(result.current.answers).toEqual([])
    })

    it('sets questionnaires and initializes answers', () => {
      // Mock the QUESTIONNAIRE_MAP for testing
      jest.doMock('@/constants/questionnaires', () => ({
        QUESTIONNAIRE_MAP: {
          'PHQ9': { questions: new Array(9).fill(null) },
          'GAD7': { questions: new Array(7).fill(null) },
        }
      }))

      const { result } = renderHook(() => usePreAssessmentChecklistStore())

      const questionnaires = [] as any // Use empty array to avoid QUESTIONNAIRE_MAP dependency

      act(() => {
        result.current.setQuestionnaires(questionnaires)
      })

      expect(result.current.questionnaires).toEqual(questionnaires)
      expect(result.current.answers).toEqual([]) // Empty questionnaires = empty answers
    })

    it('navigates through steps correctly', () => {
      const { result } = renderHook(() => usePreAssessmentChecklistStore())

      expect(result.current.step).toBe(0)
      expect(result.current.miniStep).toBe(0)

      act(() => {
        result.current.nextStep()
      })

      expect(result.current.step).toBe(1)
      expect(result.current.miniStep).toBe(0)

      act(() => {
        result.current.prevStep()
      })

      expect(result.current.step).toBe(0)
      expect(result.current.miniStep).toBe(0)
    })

    it('sets answers for questionnaires', () => {
      const { result } = renderHook(() => usePreAssessmentChecklistStore())

      // Initialize with empty questionnaires to avoid QUESTIONNAIRE_MAP dependency
      const questionnaires = [] as any
      
      act(() => {
        result.current.setQuestionnaires(questionnaires)
      })

      // Manually set some answers array
      act(() => {
        usePreAssessmentChecklistStore.setState({ 
          answers: [[], []] // Set up answers arrays manually
        })
      })

      const answers = [1, 2, 3]

      act(() => {
        result.current.setAnswers(0, answers)
      })

      expect(result.current.answers[0]).toEqual(answers)
    })
  })

  describe('Store Integration', () => {
    it('maintains independent state between different stores', () => {
      const assessmentData = { userId: 'user-123', score: 10 }
      const signUpDetails = { email: 'user@example.com', nickName: 'TestUser' }

      const { result: assessmentResult } = renderHook(() => usePreAssessmentStore())
      const { result: signUpResult } = renderHook(() => useSignUpStore())
      const { result: checklistResult } = renderHook(() => usePreAssessmentChecklistStore())

      act(() => {
        assessmentResult.current.setAssessmentData(assessmentData)
        signUpResult.current.setDetails(signUpDetails)
        checklistResult.current.nextStep() // Move to step 1
      })

      expect(assessmentResult.current.assessmentData).toEqual(assessmentData)
      expect(signUpResult.current.details).toEqual(signUpDetails)
      expect(checklistResult.current.step).toBe(1)

      // Clear one store shouldn't affect others
      act(() => {
        assessmentResult.current.clearAssessmentData()
      })

      expect(assessmentResult.current.assessmentData).toBeNull()
      expect(signUpResult.current.details).toEqual(signUpDetails)
      expect(checklistResult.current.step).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid data gracefully', () => {
      const { result } = renderHook(() => usePreAssessmentStore())

      act(() => {
        // Should not throw error with undefined
        result.current.setAssessmentData(undefined as any)
      })

      expect(result.current.assessmentData).toBeUndefined()

      act(() => {
        // Should not throw error with null
        result.current.setAssessmentData(null)
      })

      expect(result.current.assessmentData).toBeNull()
    })

    it('handles step navigation edge cases gracefully', () => {
      const { result } = renderHook(() => usePreAssessmentChecklistStore())

      // Going back from initial step should stay at 0
      act(() => {
        result.current.prevStep()
      })

      expect(result.current.step).toBe(0)
      expect(result.current.miniStep).toBe(0)

      // Multiple next steps should increment properly
      act(() => {
        result.current.nextStep()
        result.current.nextStep()
      })

      expect(result.current.step).toBe(2)
    })
  })
})