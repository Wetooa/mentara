import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetUpdateManyMutationInputSchema } from '../inputTypeSchemas/WorksheetUpdateManyMutationInputSchema'
import { WorksheetUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/WorksheetUncheckedUpdateManyInputSchema'
import { WorksheetWhereInputSchema } from '../inputTypeSchemas/WorksheetWhereInputSchema'

export const WorksheetUpdateManyArgsSchema: z.ZodType<Prisma.WorksheetUpdateManyArgs> = z.object({
  data: z.union([ WorksheetUpdateManyMutationInputSchema,WorksheetUncheckedUpdateManyInputSchema ]),
  where: WorksheetWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorksheetUpdateManyArgsSchema;
