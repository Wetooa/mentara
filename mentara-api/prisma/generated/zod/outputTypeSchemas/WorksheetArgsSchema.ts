import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetSelectSchema } from '../inputTypeSchemas/WorksheetSelectSchema';
import { WorksheetIncludeSchema } from '../inputTypeSchemas/WorksheetIncludeSchema';

export const WorksheetArgsSchema: z.ZodType<Prisma.WorksheetDefaultArgs> = z.object({
  select: z.lazy(() => WorksheetSelectSchema).optional(),
  include: z.lazy(() => WorksheetIncludeSchema).optional(),
}).strict();

export default WorksheetArgsSchema;
