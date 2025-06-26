import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialIncludeSchema } from '../inputTypeSchemas/WorksheetMaterialIncludeSchema'
import { WorksheetMaterialUpdateInputSchema } from '../inputTypeSchemas/WorksheetMaterialUpdateInputSchema'
import { WorksheetMaterialUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorksheetMaterialUncheckedUpdateInputSchema'
import { WorksheetMaterialWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereUniqueInputSchema'
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorksheetMaterialSelectSchema: z.ZodType<Prisma.WorksheetMaterialSelect> = z.object({
  id: z.boolean().optional(),
  worksheetId: z.boolean().optional(),
  filename: z.boolean().optional(),
  url: z.boolean().optional(),
  fileSize: z.boolean().optional(),
  fileType: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
}).strict()

export const WorksheetMaterialUpdateArgsSchema: z.ZodType<Prisma.WorksheetMaterialUpdateArgs> = z.object({
  select: WorksheetMaterialSelectSchema.optional(),
  include: z.lazy(() => WorksheetMaterialIncludeSchema).optional(),
  data: z.union([ WorksheetMaterialUpdateInputSchema,WorksheetMaterialUncheckedUpdateInputSchema ]),
  where: WorksheetMaterialWhereUniqueInputSchema,
}).strict() ;

export default WorksheetMaterialUpdateArgsSchema;
