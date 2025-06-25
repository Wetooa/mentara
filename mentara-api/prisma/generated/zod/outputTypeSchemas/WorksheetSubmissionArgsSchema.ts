import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSubmissionSelectSchema } from '../inputTypeSchemas/WorksheetSubmissionSelectSchema';
import { WorksheetSubmissionIncludeSchema } from '../inputTypeSchemas/WorksheetSubmissionIncludeSchema';

export const WorksheetSubmissionArgsSchema: z.ZodType<Prisma.WorksheetSubmissionDefaultArgs> = z.object({
  select: z.lazy(() => WorksheetSubmissionSelectSchema).optional(),
  include: z.lazy(() => WorksheetSubmissionIncludeSchema).optional(),
}).strict();

export default WorksheetSubmissionArgsSchema;
