import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetIncludeSchema } from '../inputTypeSchemas/WorksheetIncludeSchema'
import { WorksheetCreateInputSchema } from '../inputTypeSchemas/WorksheetCreateInputSchema'
import { WorksheetUncheckedCreateInputSchema } from '../inputTypeSchemas/WorksheetUncheckedCreateInputSchema'
import { WorksheetMaterialFindManyArgsSchema } from "../outputTypeSchemas/WorksheetMaterialFindManyArgsSchema"
import { WorksheetSubmissionFindManyArgsSchema } from "../outputTypeSchemas/WorksheetSubmissionFindManyArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { WorksheetCountOutputTypeArgsSchema } from "../outputTypeSchemas/WorksheetCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorksheetSelectSchema: z.ZodType<Prisma.WorksheetSelect> = z.object({
  id: z.boolean().optional(),
  clientId: z.boolean().optional(),
  therapistId: z.boolean().optional(),
  title: z.boolean().optional(),
  instructions: z.boolean().optional(),
  description: z.boolean().optional(),
  dueDate: z.boolean().optional(),
  status: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  submittedAt: z.boolean().optional(),
  feedback: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  materials: z.union([z.boolean(),z.lazy(() => WorksheetMaterialFindManyArgsSchema)]).optional(),
  submissions: z.union([z.boolean(),z.lazy(() => WorksheetSubmissionFindManyArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => WorksheetCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const WorksheetCreateArgsSchema: z.ZodType<Prisma.WorksheetCreateArgs> = z.object({
  select: WorksheetSelectSchema.optional(),
  include: z.lazy(() => WorksheetIncludeSchema).optional(),
  data: z.union([ WorksheetCreateInputSchema,WorksheetUncheckedCreateInputSchema ]),
}).strict() ;

export default WorksheetCreateArgsSchema;
