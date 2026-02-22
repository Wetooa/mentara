# Codebase Guidelines

Welcome to the Mentara monorepo. This document established the general guidelines, architecture, and tech stack conventions observed in the `api` and `web` applications.

## 1. Monorepo Architecture
Our project uses **Nx** as the build system and monorepo management tool.
- **Root Workspace**: Contains shared configurations like `.prettierrc`, `nx.json`, and the main `package.json` that defines dependencies and commands.
- **Apps**: Applications are housed in the `apps/` directory (e.g., `apps/api`, `apps/web`).

### Key Commands:
- API: `npm run api` (runs `nx dev mentara-api`)
- Web: `npm run web` (runs `nx dev mentara-web`)
- DB Setup: run commands like `npm run db:generate`, `npm run db:push` in the root.

---

## 2. API (Backend)
The backend service (`apps/api`) is built with **NestJS** and **Prisma ORM**.

### 2.1 Technology Stack
- **Framework**: NestJS (v11)
- **Database ORM**: Prisma (v6)
- **Language**: TypeScript

### 2.2 Directory Structure (`apps/api/src`)
The API follows a modular, feature-based NestJS architecture. 
- **Domain Modules**: Grouped into specific business domains like `auth`, `users`, `billing`, `therapist`, `booking`, `communities`, `pre-assessment`, etc. 
- Each domain directory generally encapsulates its Controllers, Services, Modules, and DTOs.
- **Cross-Cutting Concerns**: Directories like `common/`, `config/`, `decorators/`, `health/`, `types/`, and `utils/` hold logic applicable across the application.
- **Websockets/Real-time**: Found in directories like `websocket/` and `presence/` using Socket.io.

### 2.3 Conventions
- Use standard NestJS decorators and dependency injection.
- Keep business logic in `Services` and request handling in `Controllers`.
- Database access is managed via Prisma in services or dedicated repository layers.

---

## 3. Web (Frontend)
The frontend client (`apps/web`) is built with **Next.js** using the **App Router** paradigm.

### 3.1 Technology Stack
- **Framework**: Next.js (React 19)
- **Styling**: Tailwind CSS & PostCSS
- **UI Components**: Shadcn UI (Radix UI primitives) and Lucide React icons
- **State Management**: Zustand (global state) & React Query (server state & data fetching)
- **Form Handling**: React Hook Form with Zod validation.

### 3.2 Directory Structure (`apps/web`)
- **`app/`**: Next.js App Router structure. Routes are organized into route groups such as `(protected)` for authenticated views and `(public)` for public-facing views.
- **`components/`**: Reusable UI elements, many of which are generated or derived from Shadcn UI.
- **`hooks/`**: Custom React hooks.
- **`lib/`**: Utility functions, API client wrappers, and generic helpers.
- **`store/`**: Zustand slice definitions for global state management.
- **`contexts/`**: React Context providers where necessary.
- **`types/`**: Global TypeScript interfaces and types.

### 3.3 Conventions
- **Component Design**: Functional components with hooks. Prefer Tailwind CSS utility classes over custom CSS files.
- **State Management**: Use React Query for asynchronous data and caching from the API; use Zustand for purely client-side global state.
- **Routing**: Utilize route grouping `(folder)` to share layouts without affecting the URL structure. 
- Use Server Components where possible for performance, and demarcate Client Components with `"use client"` when interactivity or hooks are required.
