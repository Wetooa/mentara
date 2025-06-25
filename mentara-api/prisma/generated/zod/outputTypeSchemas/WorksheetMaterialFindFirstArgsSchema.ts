import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialIncludeSchema } from '../inputTypeSchemas/WorksheetMaterialIncludeSchema'
import { WorksheetMaterialWhereInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereInputSchema'
import { WorksheetMaterialOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorksheetMaterialOrderByWithRelationInputSchema'
import { WorksheetMaterialWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereUniqueInputSchema'
import { WorksheetMaterialScalarFieldEnumSchema } from '../inputTypeSchemas/WorksheetMaterialScalarFieldEnumSchema'
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorksheetMaterialSelectSchema: z.ZodType<Prisma.WorksheetMaterialSelect> = z.object({
  id: z.boolean().optional(),
  worksheetId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
}).strict()

export const WorksheetMaterialFindFirstArgsSchema: z.ZodType<Prisma.WorksheetMaterialFindFirstArgs> = z.object({
  select: WorksheetMaterialSelectSchema.optional(),
  include: z.lazy(() => WorksheetMaterialIncludeSchema).optional(),
  where: WorksheetMaterialWhereInputSchema.optional(),
  orderBy: z.union([ WorksheetMaterialOrderByWithRelationInputSchema.array(),WorksheetMaterialOrderByWithRelationInputSchema ]).optional(),
  cursor: WorksheetMaterialWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WorksheetMaterialScalarFieldEnumSchema,WorksheetMaterialScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default WorksheetMaterialFindFirstArgsSchema;
