import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetCreateManyInputSchema } from '../inputTypeSchemas/WorksheetCreateManyInputSchema'

export const WorksheetCreateManyAndReturnArgsSchema: z.ZodType<Prisma.WorksheetCreateManyAndReturnArgs> = z.object({
  data: z.union([ WorksheetCreateManyInputSchema,WorksheetCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorksheetCreateManyAndReturnArgsSchema;
