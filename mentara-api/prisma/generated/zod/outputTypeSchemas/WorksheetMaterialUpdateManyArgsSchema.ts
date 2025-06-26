import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialUpdateManyMutationInputSchema } from '../inputTypeSchemas/WorksheetMaterialUpdateManyMutationInputSchema'
import { WorksheetMaterialUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/WorksheetMaterialUncheckedUpdateManyInputSchema'
import { WorksheetMaterialWhereInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereInputSchema'

export const WorksheetMaterialUpdateManyArgsSchema: z.ZodType<Prisma.WorksheetMaterialUpdateManyArgs> = z.object({
  data: z.union([ WorksheetMaterialUpdateManyMutationInputSchema,WorksheetMaterialUncheckedUpdateManyInputSchema ]),
  where: WorksheetMaterialWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorksheetMaterialUpdateManyArgsSchema;
