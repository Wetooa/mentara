import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetWhereInputSchema } from '../inputTypeSchemas/WorksheetWhereInputSchema'

export const WorksheetDeleteManyArgsSchema: z.ZodType<Prisma.WorksheetDeleteManyArgs> = z.object({
  where: WorksheetWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorksheetDeleteManyArgsSchema;
