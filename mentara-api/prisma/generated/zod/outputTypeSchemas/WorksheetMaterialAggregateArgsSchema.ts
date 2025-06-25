import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialWhereInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereInputSchema'
import { WorksheetMaterialOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorksheetMaterialOrderByWithRelationInputSchema'
import { WorksheetMaterialWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereUniqueInputSchema'

export const WorksheetMaterialAggregateArgsSchema: z.ZodType<Prisma.WorksheetMaterialAggregateArgs> = z.object({
  where: WorksheetMaterialWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetMaterialOrderByWithRelationInputSchema.array(),WorksheetMaterialOrderByWithRelationInputSchema ]).optional(),
  cursor: WorksheetMaterialWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default WorksheetMaterialAggregateArgsSchema;
