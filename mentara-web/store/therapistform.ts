import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TherapistFormState {
  // Generic form values container for dynamic field handling
  formValues: Record<string, any>;
  otherSpecify: Record<string, string>;
  errors: Record<string, string>;

  // Other specific fields
  documents: {
    prcLicense: File[];
    nbiClearance: File[];
    resumeCV: File[];
    liabilityInsurance: File[];
    birForm: File[];
  };
  consentChecked: boolean;



  // Methods
  updateField: (fieldKey: string, value: any) => void;
  updateNestedField: (group: string, field: string, value: any) => void;
  updateOtherSpecify: (specifyKey: string, value: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  updateDocuments: (
    docType: keyof TherapistFormState["documents"],
    files: File[]
  ) => void;
  removeDocument: (
    docType: keyof TherapistFormState["documents"],
    index: number
  ) => void;
  updateConsent: (checked: boolean) => void;
  resetForm: () => void;
}

const useTherapistForm = create<TherapistFormState>()(
  persist(
    (set, get) => ({
      // Initial state
      formValues: {}, // Generic container for all form values
      otherSpecify: {}, // Container for "other/specify" field values
      errors: {}, // Container for validation errors

      documents: {
        prcLicense: [],
        nbiClearance: [],
        resumeCV: [],
        liabilityInsurance: [],
        birForm: [],
      },
      consentChecked: false,

      // Methods
      updateField: (fieldKey, value) =>
        set((state) => {
          // Only update if the value has actually changed
          if (state.formValues[fieldKey] === value) {
            return state;
          }
          return {
            ...state,
            formValues: {
              ...state.formValues,
              [fieldKey]: value,
            },
          };
        }),

      updateNestedField: (group, field, value) =>
        set((state) => {
          // Check if the group exists in formValues
          const groupState = state.formValues[group] || {};
          
          // Only update if the value has actually changed
          if (groupState[field] === value) {
            return state;
          }

          return {
            ...state,
            formValues: {
              ...state.formValues,
              [group]: {
                ...groupState,
                [field]: value,
              },
            },
          };
        }),

      updateOtherSpecify: (specifyKey, value) =>
        set((state) => ({
          ...state,
          otherSpecify: {
            ...state.otherSpecify,
            [specifyKey]: value,
          },
        })),

      setErrors: (errors) =>
        set((state) => ({
          ...state,
          errors,
        })),

      updateDocuments: (docType, files) =>
        set((state) => ({
          ...state,
          documents: {
            ...state.documents,
            [docType]: files,
          },
        })),

      removeDocument: (docType, index) =>
        set((state) => ({
          ...state,
          documents: {
            ...state.documents,
            [docType]: state.documents[docType].filter((_, i) => i !== index),
          },
        })),

      updateConsent: (checked) =>
        set((state) => ({
          ...state,
          consentChecked: checked,
        })),



      resetForm: () =>
        set(() => ({
          formValues: {},
          otherSpecify: {},
          errors: {},
          documents: {
            prcLicense: [],
            nbiClearance: [],
            resumeCV: [],
            liabilityInsurance: [],
            birForm: [],
          },
          consentChecked: false,
        })),
    }),
    {
      name: "therapist-form-storage", // unique name for localStorage key
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            // Don't persist File objects as they can't be serialized
            if (parsed.state?.documents) {
              parsed.state.documents = {
                prcLicense: [],
                nbiClearance: [],
                resumeCV: [],
                liabilityInsurance: [],
                birForm: [],
              };
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Create a copy without File objects for serialization
            const serializable = {
              ...value,
              state: {
                ...value.state,
                documents: {
                  prcLicense: [],
                  nbiClearance: [],
                  resumeCV: [],
                  liabilityInsurance: [],
                  birForm: [],
                },

              },
            };
            localStorage.setItem(name, JSON.stringify(serializable));
          } catch (error) {
            console.warn("Failed to save form data to localStorage:", error);
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        formValues: state.formValues,
        otherSpecify: state.otherSpecify,
        consentChecked: state.consentChecked,
      }),
    }
  )
);

export default useTherapistForm;
