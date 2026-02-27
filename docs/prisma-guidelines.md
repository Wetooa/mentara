# Prisma Model Guidelines

This document outlines the best practices and standards for defining Prisma models within the Mentara ecosystem.

## 1. Schema Organization

The Prisma schema is split into multiple files for better maintainability.
- **Core Configuration**: Defined in `apps/api/prisma/schema.prisma`.
- **Domain Models**: Defined in `apps/api/prisma/models/*.prisma`.

### Split Schema Best Practices
- Keep related models together in a single file (e.g., `booking.prisma` contains `Meeting`, `MeetingNotes`, and `TherapistAvailability`).
- Ensure all models are properly imported/merged (automatic via build process).

## 2. Naming Conventions

### Models
- **Case**: `PascalCase`
- **Number**: Singular (e.g., `User`, not `Users`).
- **Database Mapping**: Use `@@map` if the database table name must differ from the model name.

### Fields
- **Case**: `camelCase`
- **Database Mapping**: Use `@map` if the database column name must differ from the field name.

### Relations
- **Naming**: Use descriptive names for relations, especially when multiple relations exist between the same models.
- **Case**: `PascalCase` (e.g., `@relation("UserAdmin")`).

## 3. Standard Fields

### IDs
- Use `String` as the ID type with `uuid()` as the default value.
  ```prisma
  id String @id @default(uuid())
  ```
- Use `autoincrement()` only for internal surrogate keys that are never exposed.

### Audit Fields
- Every model (where applicable) should include audit timestamps:
  ```prisma
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ```

### Soft Deletes & Status
- Use `isActive` boolean or a `status` enum instead of hard deletes where data retention is required.

## 4. Relationships

- **Explicit Foreign Keys**: Always define foreign key fields explicitly.
- **Cascade Actions**: Define `onDelete: Cascade` or `onDelete: SetNull` purposefully.
  ```prisma
  client Client @relation("ClientMeetings", fields: [clientId], references: [userId], onDelete: Cascade)
  ```
- **Bidirectional Relations**: Ensure both sides of a relationship are defined.

## 5. Indexing and Constraints

- **Indexes**: Add `@@index` for:
    - Foreign keys (Prisma requires this for some providers, and it's good for performance).
    - Fields used in `WHERE`, `ORDER BY`, or `DISTINCT` clauses.
- **Uniqueness**: Use `@unique` or `@@unique` for fields or combinations that must be unique.
  ```prisma
  @@unique([therapistId, dayOfWeek, startTime, endTime])
  ```

## 6. Enums

- **Case**: `PascalCase` for the Enum name.
- **Values**: `UPPERCASE` for the values.
  ```prisma
  enum MeetingStatus {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }
  ```

## 7. Performance Tips

- **Pruning Fields**: Avoid large strings or JSON fields unless necessary; consider normalization if the JSON structure is stable.
- **Partial Indexes**: (Provider dependent) Use where possible for large tables.
- **Relational Integrity**: Let Prisma handle relational integrity where the database doesn't support it natively, but prefer database-level constraints.
