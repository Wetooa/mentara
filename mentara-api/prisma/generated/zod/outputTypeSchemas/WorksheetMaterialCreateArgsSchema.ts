import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialIncludeSchema } from '../inputTypeSchemas/WorksheetMaterialIncludeSchema'
import { WorksheetMaterialCreateInputSchema } from '../inputTypeSchemas/WorksheetMaterialCreateInputSchema'
import { WorksheetMaterialUncheckedCreateInputSchema } from '../inputTypeSchemas/WorksheetMaterialUncheckedCreateInputSchema'
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

export const WorksheetMaterialCreateArgsSchema: z.ZodType<Prisma.WorksheetMaterialCreateArgs> = z.object({
  select: WorksheetMaterialSelectSchema.optional(),
  include: z.lazy(() => WorksheetMaterialIncludeSchema).optional(),
  data: z.union([ WorksheetMaterialCreateInputSchema,WorksheetMaterialUncheckedCreateInputSchema ]),
}).strict() ;

export default WorksheetMaterialCreateArgsSchema;
