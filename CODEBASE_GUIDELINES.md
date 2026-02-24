# Mentara Ecosystem: Architecture Realignment and Codebase Guidelines

## Current Architecture Assessment and Realignment Strategy
The current architecture exhibits several anti-patterns that hinder scalability, maintainability, and developer velocity. The codebase shows signs of technical debt, specifically in how server state is managed, how the frontend interacts with the backend, and how authentication flows are handled. Business logic occasionally leaks into API controllers on the backend, and the frontend suffers from tightly coupled components and manual API fetching methods. 

The strategy for realignment centers on establishing a strict separation of concerns. The backend must adhere strictly to the controller-service-repository pattern utilizing NestJS best practices, ensuring all database interactions and business rules remain within the service layer. The Next.js frontend will be realigned to utilize Orval-generated client libraries exclusively for data fetching, cleanly separating server state managed by React Query from local UI state managed by Zustand. The goal is a highly modular, type-safe, and predictable ecosystem.

## Authentication System Overview
Authentication within the ecosystem relies on JWTs, with session management requiring rigorous enforcement across both server and client. The current flaws involve fragmented authentication checks and inconsistent handling of anonymous user sessions, particularly during pre-assessment flows where session IDs fail to link correctly upon registration.

Moving forward, authentication must be centralized. The custom Next.js middleware and central auth context must be the sole arbiters of a user's logged-in state. Tokens must be stored securely, and routing guards must be uniformly applied at the Next.js layout layer rather than at the individual page component level. For backend services, Passport strategies must be applied consistently across all protected NestJS endpoints using global or module-scoped guards. Anonymous sessions must utilize a formalized session-id tracking mechanism that seamlessly merges into a persistent user record upon authentication, eliminating orphaned records.

## API Integration Guide
The current codebase contains legacy patterns where manual `fetch` or custom Axios instances are used directly within React components or unstructured custom hooks. This circumvents the type-safety and centralization of our toolchain.

All API integrations must now exclusively use the Orval-generated React Query hooks. Manual HTTP requests are strictly deprecated. When an endpoint is added or modified in the NestJS Swagger specification, the OpenAPI generator must be run to produce the corresponding client hooks. Components should only consume these generated hooks, ensuring perfect type alignment between the NestJS backend and the Next.js frontend. Any data transformations required for the UI should occur within the React Query `select` callback, keeping the component rendering logic clean.

## State Management Patterns
A major flaw in the current architecture is the blending of server state and client state. Instances exist where API responses are manually injected into Zustand stores or React state, leading to cache invalidation bugs, stale data, and race conditions.

The realigned architecture mandates a strict division. Server state refers to any data that resides on the database and is fetched via the API. This state must be managed entirely by React Query using the generated Orval hooks. React Query will handle caching, revalidation, and loading states. Client state refers to ephemeral UI state, such as modal visibility, dark mode preferences, or multi-step form progress. This state must be managed by Zustand. Developers must never duplicate server data into a Zustand store. 

## Database Interaction Patterns
Within the NestJS backend, database interactions using Prisma have occasionally bypassed proper transaction management, and raw queries or complex aggregations have been scattered across controllers or disparate utilities.

All database logic must reside exclusively within dedicated NestJS services or repositories. Controllers are strictly responsible for handling HTTP requests, validating DTOs, and delegating to services. When performing multiple related mutations, developers must utilize Prisma interactive transactions to ensure data integrity and prevent partial updates. The use of Prisma's generated types is mandatory; untyped objects or implicit `any` usage when returning database records is strictly forbidden. 

## Component Architecture
The Next.js frontend currently contains bloated, monolithic components where data fetching, complex business logic, and UI rendering are tightly coupled. This makes components difficult to test, reuse, or refactor.

The target architecture enforces atomic design principles. Components must be broken down into atomic, highly focused units. Page components should primarily act as data-fetching orchestrators and layout containers. They should fetch data using React Query and pass that data downwards as props to pure, stateless UI components. UI components should rely on the Radix UI primitives and Tailwind CSS for styling, adhering to a strict composition pattern. Complex forms must utilize React Hook Form coupled with Zod resolvers for schema validation, extracting the validation schemas into shared configuration files.

## Common Workflows
When implementing a new feature, a developer must follow a specific sequence to maintain architectural integrity. First, the database schema in Prisma must be updated and migrated. Second, the NestJS backend routes must be created, starting with strongly-typed DTOs, followed by service logic, and finally the controller endpoints with proper Swagger decorators. Third, the OpenAPI generator must be executed to synchronize the frontend API client. Fourth, frontend development begins by utilizing the newly generated React Query hooks within page orchestrators. Finally, atomic UI components are built or reused to render the data, and Zustand is implemented only if complex local UI state is required.

## Testing Strategy
The realigned architecture demands a robust testing strategy to prevent regressions. Unit tests for the NestJS backend must utilize Jest to isolate and test service logic, heavily mocking Prisma interactions to ensure fast execution. Backend controllers require end-to-end integration tests using Supertest to validate routing, guards, and serialization. On the frontend, pure UI components must be tested using React Testing Library and Jest, focusing on accessibility and user interactions without requiring network requests. Playwright will be utilized for critical user journey end-to-end tests, such as the complete authentication and pre-assessment flows, executed against a localized test database.

## Essential Package Commands
The following critical commands from the [package.json](cci:7://file:///home/tr-ggr/NerdProjects/mentara-ecosystem/mentara/package.json:0:0-0:0) must be used by developers to orchestrate the ecosystem and maintain alignment with the architecture:

- `npm run api`: Bootstraps the NestJS backend development server (`nx dev mentara-api`).
- `npm run web`: Bootstraps the Next.js frontend development server (`nx dev mentara-web`).
- `npm run landing`: Bootstraps the landing page development server (`nx dev mentara-landing`).
- `npm run generate:api`: Executes the OpenAPI generator (`nx run api-client:generate`). This must be executed immediately following any modification to NestJS controllers or DTOs to ensure frontend client synchronization.
- `npm run db:migrate`: Executes Prisma migrations (`prisma migrate dev`), applying schema changes to the database and automatically regenerating the Prisma client.
- `npm run db:generate`: Manually regenerates the Prisma client (`prisma generate`) based on the current schema. Useful after pulling updates that do not require full migrations.
- `npm run db:seed`: Populates the development database with foundational mock data (`ts-node apps/api/prisma/seed.ts`).
- `npm run test`: Fires the test runner across the entire monorepo (`nx run-many -t test`) to validate service logic and components.
- `npm run lint`: Triggers the linter across all architectural boundaries (`nx run-many -t lint`) to enforce strict code-style consistency.

## Common Pitfalls and Anti-Patterns to Avoid
* Bypassing the Orval-generated API client to make manual Axios or fetch calls directly from components.
* Storing server data, such as user profiles or questionnaire results, inside a Zustand store.
* Handling database queries or complex business logic directly within NestJS controllers.
* Creating monolithic React components that mix complex data fetching, local state, and extensive markup.
* Failing to wrap related database mutations within Prisma transactions, risking data corruption.
* Managing authentication state manually in isolated components rather than relying on strictly enforced middleware and global context providers.
* Duplicating Swagger types manually on the frontend instead of relying on the automated generator pipeline.
