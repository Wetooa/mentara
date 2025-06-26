import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionIncludeSchema } from '../inputTypeSchemas/WorksheetSubmissionIncludeSchema'
import { WorksheetSubmissionUpdateInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUpdateInputSchema'
import { WorksheetSubmissionUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorksheetSubmissionUncheckedUpdateInputSchema'
import { WorksheetSubmissionWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereUniqueInputSchema'
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorksheetSubmissionSelectSchema: z.ZodType<Prisma.WorksheetSubmissionSelect> = z.object({
  id: z.boolean().optional(),
  worksheetId: z.boolean().optional(),
  clientId: z.boolean().optional(),
  filename: z.boolean().optional(),
  url: z.boolean().optional(),
  fileSize: z.boolean().optional(),
  fileType: z.boolean().optional(),
  content: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
}).strict()

export const WorksheetSubmissionUpdateArgsSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateArgs> = z.object({
  select: WorksheetSubmissionSelectSchema.optional(),
  include: z.lazy(() => WorksheetSubmissionIncludeSchema).optional(),
  data: z.union([ WorksheetSubmissionUpdateInputSchema,WorksheetSubmissionUncheckedUpdateInputSchema ]),
  where: WorksheetSubmissionWhereUniqueInputSchema,
}).strict() ;

export default WorksheetSubmissionUpdateArgsSchema;
