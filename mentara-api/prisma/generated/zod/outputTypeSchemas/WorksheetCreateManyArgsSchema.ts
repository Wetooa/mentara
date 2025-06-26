import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetCreateManyInputSchema } from '../inputTypeSchemas/WorksheetCreateManyInputSchema'

export const WorksheetCreateManyArgsSchema: z.ZodType<Prisma.WorksheetCreateManyArgs> = z.object({
  data: z.union([ WorksheetCreateManyInputSchema,WorksheetCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorksheetCreateManyArgsSchema;
