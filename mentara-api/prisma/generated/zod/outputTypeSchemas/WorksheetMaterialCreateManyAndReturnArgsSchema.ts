import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialCreateManyInputSchema } from '../inputTypeSchemas/WorksheetMaterialCreateManyInputSchema'

export const WorksheetMaterialCreateManyAndReturnArgsSchema: z.ZodType<Prisma.WorksheetMaterialCreateManyAndReturnArgs> = z.object({
  data: z.union([ WorksheetMaterialCreateManyInputSchema,WorksheetMaterialCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorksheetMaterialCreateManyAndReturnArgsSchema;
