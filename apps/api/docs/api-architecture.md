# Mentara API Architecture Guide

This document defines the architectural standards for the Mentara Backend, focusing on the **Shared Prisma Module Strategy**.

## 1. Core Principles
- **Unidirectional Data Flow**: Controllers → Services → Prisma/Repositores.
- **Global Infrastructure**: Infrastructure concerns (DB, Config, Logging) are centered in the `core/` folder.
- **Feature Encapsulation**: Each business feature is self-contained.

## 2. Folder Structure Overview

```text
src/
├── app.module.ts
├── main.ts
├── core/                  # Global Singletons & Infrastructure
│   ├── prisma/            # Shared Prisma Service
│   ├── config/            # Variable validation & access
│   └── providers/         # Global Infrastructure Providers (e.g., Mailer, S3)
├── common/                # Shared utilities & cross-cutting concerns
│   ├── dto/               # Global DTOs (Pagination, etc.)
│   ├── filters/           # Global Exception Filters
│   └── decorators/        # Custom Annotations
└── modules/               # Domain-driven features
    ├── users/
    │   ├── dto/           # Request/Response DTOs
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   └── users.module.ts
    └── auth/
```

## 3. Provider Placement Guide

In NestJS, almost everything is a "Provider". Here is where to categorize them:

### A. Infrastructure Providers (Global)
*   **Where**: `src/core/providers/`
*   **Examples**: `StripeProvider`, `AwsS3Service`, `EmailService`, `PrismaService`.
*   **Rule**: These should usually be wrapped in a module and exported globally or injected into `AppModule`.

### B. Feature Providers (Local)
*   **Where**: `src/modules/<feature>/`
*   **Examples**: `UsersService`, `BillingService`.
*   **Rule**: Keep them inside their feature folder. If another module needs them, export them via the `<Feature>Module`.

### C. Helper/Utility Providers
*   **Where**: `src/common/` (as classes) or `src/utils/` (as pure functions).
*   **Rule**: If it requires dependency injection (e.g., a `HashService` that needs `ConfigService`), make it a provider in `common/`. If it's a pure math/string helper, use a utility function.

## 4. Shared Prisma Implementation
To maintain a single Prisma folder:
1.  **Generate**: Keep `prisma/` at the root.
2.  **Service**: Create `src/core/prisma/prisma.service.ts` extending `PrismaClient`.
3.  **Module**: Create `src/core/prisma/prisma.module.ts` marked with `@Global()`.
4.  **Usage**: Every service in `modules/` simply injects `PrismaService`.

## 5. DTO & Type Management
*   **Request DTOs**: Inside `modules/<feature>/dto/`. Used for `POST/PATCH` validation.
*   **Response DTOs**: Inside `modules/<feature>/dto/`. Use `class-transformer` to prune `Prisma` models before returning to client.
*   **Prisma Types**: Use the auto-generated types from `@prisma/client` only within the **Service** layer. Do not leak them to the Controller directly if you need to hide fields.
