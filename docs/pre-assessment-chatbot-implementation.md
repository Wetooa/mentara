# Pre-Assessment Chatbot Implementation Documentation

This document details the implementation of the AURIS-powered Pre-Assessment Chatbot in the Mentara ecosystem.

## 1. Architectural Overview
The chatbot follows a microservices-assisted pattern:
1. **Frontend (Next.js)**: Provides the chat interface and manages session state.
2. **Backend (NestJS API)**: Acts as a secure proxy to the AI microservice and handles data persistence.
3. **AI Microservice (Flask)**: Hosts the LLM logic (AURIS) that conducts the clinical interview.
4. **Database (PostgreSQL/Prisma)**: Persists the structured results and conversation metadata.

---

## 2. Frontend Implementation (`apps/web`)

### 2.1 Core Components
- **`ChatbotInterface.tsx`** (`apps/web/components/pre-assessment/ChatbotInterface.tsx`): 
    - The main UI container.
    - Handles message rendering, user input, and session lifecycle (start/reset/end).
    - Uses `framer-motion` for smooth bubble animations and `lucide-react` for iconography.
- **`MessageBubble.tsx`** (`apps/web/components/pre-assessment/chatbot/MessageBubble.tsx`):
    - Renders individual messages for both 'user' and 'assistant'.
    - Supports markdown-like text and different message types.

### 2.2 Hooks & State Management
- **`useChatbot.ts`** (`apps/web/hooks/pre-assessment/useChatbot.ts`):
    - Reactive hook that encapsulates the chat logic.
    - Manages local `messages` state and `isLoading` status.
    - Uses generated API clients (`api-client`) to communicate with the NestJS backend.
    - **Methods**: `startSession()`, `sendMessage()`, `endSession()`, `resetSession()`.
- **`usePreAssessment.ts`** (`apps/web/hooks/pre-assessment/usePreAssessment.ts`):
    - Higher-level hook that manages the transition between the chatbot/checklist and the subsequent registration phases.

---

## 3. Backend Implementation (`apps/api`)

### 3.1 API Entry Points
- **`PreAssessmentController`** (`apps/api/src/pre-assessment/pre-assessment.controller.ts`):
    - `POST /pre-assessment/session/new`: Initializes a new AURIS session.
    - `POST /pre-assessment/chat`: Proxies a message to AURIS.
    - `POST /pre-assessment/session/:sessionId/end`: Finalizes the session and triggers result extraction.
    - `GET /pre-assessment/session/:sessionId/pdf/summary`: Downloads the clinical summary.

### 3.2 Services
- **`AurisService`** (`apps/api/src/pre-assessment/auris.service.ts`):
    - **Role**: Communicates with the Flask microservice URL defined by `FLASK_MICROSERVICE_URL`.
    - **Automatic Persistence**: When a chat or end-session response contains `is_complete: true`, it automatically calls `PreAssessmentService.createPreAssessment` to save results.
- **`PreAssessmentService`** (`apps/api/src/pre-assessment/pre-assessment.service.ts`):
    - Handles CRUD operations for the `PreAssessment` model.
    - Supports anonymous session linking (associating a guest session with a user ID after registration).

---

## 4. Data Model & Persistence

### 4.1 Prisma Schema (`apps/api/prisma/models/pre-assessment.prisma`)
The `PreAssessment` model is designed to be flexible:
- `method`: `CHATBOT` (distinguishes it from the `CHECKLIST` method).
- `data`: A `Json` field containing:
    - `questionnaireScores`: Normalized scores for identified clinical tools (GAD-7, PHQ-9, etc.).
    - `extracted_data`: Key clinical findings extracted by AURIS.
- `sessionId`: Unique identifier for the AURIS session, used for anonymous tracking.
- `clientId`: Nullable; linked to the `Client` table once the user registers.

---

## 5. Typical Data Flow
1. **Init**: User clicks "Begin Assessment" -> `startSession()` calls API `/session/new`.
2. **Interaction**: User types message -> `sendMessage()` calls API `/chat`.
3. **AI Processing**: API proxies to Flask -> AURIS processes logic -> Returns JSON with message + updated state.
4. **Completion**: AURIS flags `is_complete` -> API saves results to DB -> Frontend transitions to `SNAPSHOT` view.
5. **Registration**: User registers -> API calls `linkAnonymousPreAssessment` to attach the record to the new `clientId`.

---

## 6. Key Configuration
- `FLASK_MICROSERVICE_URL`: The environment variable pointing to the AURIS interview engine.
- Interaction timeouts are set to **120 seconds** in `AurisService` to accommodate LLM latency.
