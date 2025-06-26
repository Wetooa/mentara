import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialCreateManyInputSchema } from '../inputTypeSchemas/WorksheetMaterialCreateManyInputSchema'

export const WorksheetMaterialCreateManyArgsSchema: z.ZodType<Prisma.WorksheetMaterialCreateManyArgs> = z.object({
  data: z.union([ WorksheetMaterialCreateManyInputSchema,WorksheetMaterialCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorksheetMaterialCreateManyArgsSchema;
