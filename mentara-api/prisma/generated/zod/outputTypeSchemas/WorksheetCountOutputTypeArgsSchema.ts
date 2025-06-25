import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetCountOutputTypeSelectSchema } from './WorksheetCountOutputTypeSelectSchema';

export const WorksheetCountOutputTypeArgsSchema: z.ZodType<Prisma.WorksheetCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => WorksheetCountOutputTypeSelectSchema).nullish(),
}).strict();

export default WorksheetCountOutputTypeSelectSchema;
