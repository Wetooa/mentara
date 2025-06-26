import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialWhereInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereInputSchema'

export const WorksheetMaterialDeleteManyArgsSchema: z.ZodType<Prisma.WorksheetMaterialDeleteManyArgs> = z.object({
  where: WorksheetMaterialWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorksheetMaterialDeleteManyArgsSchema;
