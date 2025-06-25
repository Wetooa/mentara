import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetWhereInputSchema } from '../inputTypeSchemas/WorksheetWhereInputSchema'
import { WorksheetOrderByWithAggregationInputSchema } from '../inputTypeSchemas/WorksheetOrderByWithAggregationInputSchema'
import { WorksheetScalarFieldEnumSchema } from '../inputTypeSchemas/WorksheetScalarFieldEnumSchema'
import { WorksheetScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/WorksheetScalarWhereWithAggregatesInputSchema'

export const WorksheetGroupByArgsSchema: z.ZodType<Prisma.WorksheetGroupByArgs> = z.object({
  where: WorksheetWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetOrderByWithAggregationInputSchema.array(),WorksheetOrderByWithAggregationInputSchema ]).optional(),
  by: WorksheetScalarFieldEnumSchema.array(),
  having: WorksheetScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorksheetGroupByArgsSchema;
