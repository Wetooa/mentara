# Pre-Assessment Checklist Implementation Documentation

This document provides a comprehensive overview of the Pre-Assessment Checklist implementation in the Mentara ecosystem. This information is intended to support the planned migration.

## 1. Overview
The pre-assessment flow is a multi-step process designed to understand a client's mental health needs before they begin therapy. It uses either a **Checklist (Rapport Wizard)** or a **Chatbot** to gather initial data, followed by clinical screening questionnaires.

- **Frontend**: Next.js (apps/web)
- **Backend**: NestJS (apps/api)
- **Database**: Prisma with PostgreSQL
- **State Management**: Zustand

## 2. Core Implementation (Frontend)

### 2.1 Multi-Step Flow
The process is managed by a centralized Zustand store (`apps/web/store/pre-assessment.ts`) which defines four primary steps:
1. **Step 0: Rapport Wizard (Checklist)** - Initial 5-question intake.
2. **Step 1: Screening Assessment** - Clinical questionnaires (e.g., PHQ-9, GAD-7) based on Step 0 results.
3. **Step 2: Snapshot View** - Visual summary of result scores.
4. **Step 3: Registration** - Finalizing the account and persisting results.

### 2.2 Rapport Wizard & Weighted Ranking Algorithm
The "Checklist" mode uses a **Weighted Ranking Algorithm** to prioritize which clinical questionnaires a user should take.
- **Data Source**: `apps/web/constants/questionnaire/rapport-mapping.ts`.
- **Logic**: Users answer 5 questions across categories: Physical Energy, Focus, Emotional Mood, Social Interactions, and Control/Coping.
- **Weights**: Each response choice has assigned weights for various clinical tools (e.g., "Depression": 5, "Anxiety": 3).
- **Selection**: The `calculateTopQuestionnaires` function in the Zustand store sums these weights and selects the **Top 3** questionnaires for the screening phase.

### 2.3 Key UI Components
- **`PreAssessmentPage.tsx`**: The main container managing the conditional rendering of steps.
- **`ChecklistForm.tsx`**: Renders the 5-question rapport wizard.
- **`QuestionnaireForm.tsx`**: Renders the clinical questionnaires dynamically based on selected tools.
- **`ProgressBar.tsx`**: Shows progress through the rapport and screening phases.

### 2.4 Hooks
- **`usePreAssessmentChecklist.ts`**: Encapsulates logic for the rapport wizard answers.
- **`usePreAssessment.ts`**: Manages step transitions and animations (using Framer Motion).

## 3. Backend & Persistence

### 3.1 Data Model
The `PreAssessment` model in Prisma (`apps/api/prisma/models/pre-assessment.prisma`) stores the final results:
- `method`: Enum (`CHECKLIST`, `CHATBOT`, `HYBRID`).
- `data`: A `Json` field containing questionnaire scores and detailed response mappings.
- `clientId`: Optional, linked to the `Client` model after registration.
- `sessionId`: Used for tracking anonymous assessments before the user creates an account.

### 3.2 API Services
- **`PreAssessmentService`** (`apps/api/src/pre-assessment/pre-assessment.service.ts`):
    - `createPreAssessment`: Saves/Updates data for registered users.
    - `createAnonymousPreAssessment`: Saves data for guest users using a session ID.
    - `linkAnonymousPreAssessment`: Associates a guest assessment with a newly created user account during registration.

## 4. Key Files Summary

| Component | Path |
|-----------|------|
| **Database Schema** | `apps/api/prisma/models/pre-assessment.prisma` |
| **Backend Service** | `apps/api/src/pre-assessment/pre-assessment.service.ts` |
| **Zustand Store** | `apps/web/store/pre-assessment.ts` |
| **Weighted Mapping** | `apps/web/constants/questionnaire/rapport-mapping.ts` |
| **Checklist View** | `apps/web/components/pre-assessment/forms/ChecklistForm.tsx` |
| **Main Page** | `apps/web/app/(public)/(client)/pre-assessment/page.tsx` |
| **Primary Hook** | `apps/web/hooks/pre-assessment/usePreAssessment.ts` |

## 5. Migration Considerations
- **Algorithm Transparency**: The weighted mapping in `rapport-mapping.ts` is the "brain" of the selection process. Ensure this logic is ported if the scoring system changes.
- **Anonymous Session Linking**: The mechanism in `PreAssessmentService` for linking anonymous data to users is critical for the conversion funnel.
- **Json Data Structure**: The `data` field in the database is flexible; ensure schema validation (DTOs) is maintained during migration to avoid data corruption.
