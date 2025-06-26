import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetWhereInputSchema } from '../inputTypeSchemas/WorksheetWhereInputSchema'
import { WorksheetOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorksheetOrderByWithRelationInputSchema'
import { WorksheetWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetWhereUniqueInputSchema'

export const WorksheetAggregateArgsSchema: z.ZodType<Prisma.WorksheetAggregateArgs> = z.object({
  where: WorksheetWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetOrderByWithRelationInputSchema.array(),WorksheetOrderByWithRelationInputSchema ]).optional(),
  cursor: WorksheetWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorksheetAggregateArgsSchema;
