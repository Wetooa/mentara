import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionIncludeSchema } from '../inputTypeSchemas/WorksheetSubmissionIncludeSchema'
import { WorksheetSubmissionWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetSubmissionWhereUniqueInputSchema'
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

export const WorksheetSubmissionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.WorksheetSubmissionFindUniqueOrThrowArgs> = z.object({
  select: WorksheetSubmissionSelectSchema.optional(),
  include: z.lazy(() => WorksheetSubmissionIncludeSchema).optional(),
  where: WorksheetSubmissionWhereUniqueInputSchema,
}).strict() ;

export default WorksheetSubmissionFindUniqueOrThrowArgsSchema;
