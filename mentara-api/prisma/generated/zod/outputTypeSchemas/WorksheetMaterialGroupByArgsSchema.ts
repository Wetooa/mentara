import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialWhereInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereInputSchema'
import { WorksheetMaterialOrderByWithAggregationInputSchema } from '../inputTypeSchemas/WorksheetMaterialOrderByWithAggregationInputSchema'
import { WorksheetMaterialScalarFieldEnumSchema } from '../inputTypeSchemas/WorksheetMaterialScalarFieldEnumSchema'
import { WorksheetMaterialScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/WorksheetMaterialScalarWhereWithAggregatesInputSchema'

export const WorksheetMaterialGroupByArgsSchema: z.ZodType<Prisma.WorksheetMaterialGroupByArgs> = z.object({
  where: WorksheetMaterialWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetMaterialOrderByWithAggregationInputSchema.array(),WorksheetMaterialOrderByWithAggregationInputSchema ]).optional(),
  by: WorksheetMaterialScalarFieldEnumSchema.array(),
  having: WorksheetMaterialScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorksheetMaterialGroupByArgsSchema;
