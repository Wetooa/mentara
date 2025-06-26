import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionIncludeSchema } from '../inputTypeSchemas/WorksheetSubmissionIncludeSchema'
import { WorksheetSubmissionWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereUniqueInputSchema'
import { WorksheetSubmissionCreateInputSchema } from '../inputTypeSchemas/WorksheetSubmissionCreateInputSchema'
import { WorksheetSubmissionUncheckedCreateInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUncheckedCreateInputSchema'
import { WorksheetSubmissionUpdateInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUpdateInputSchema'
import { WorksheetSubmissionUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUncheckedUpdateInputSchema'
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorksheetSubmissionSelectSchema: z.ZodType<Prisma.WorksheetSubmissionSelect> = z.object({
  id: z.boolean().optional(),
  worksheetId: z.boolean().optional(),
  clientId: z.boolean().optional(),
  content: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export const WorksheetSubmissionUpsertArgsSchema: z.ZodType<Prisma.WorksheetSubmissionUpsertArgs> = z.object({
  select: WorksheetSubmissionSelectSchema.optional(),
  include: z.lazy(() => WorksheetSubmissionIncludeSchema).optional(),
  where: WorksheetSubmissionWhereUniqueInputSchema,
  create: z.union([ WorksheetSubmissionCreateInputSchema,WorksheetSubmissionUncheckedCreateInputSchema ]),
  update: z.union([ WorksheetSubmissionUpdateInputSchema,WorksheetSubmissionUncheckedUpdateInputSchema ]),
}).strict() ;

export default WorksheetSubmissionUpsertArgsSchema;
