import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialIncludeSchema } from '../inputTypeSchemas/WorksheetMaterialIncludeSchema'
import { WorksheetMaterialWhereUniqueInputSchema } from '../inputTypeSchemas/WorksheetMaterialWhereUniqueInputSchema'
import { WorksheetMaterialCreateInputSchema } from '../inputTypeSchemas/WorksheetMaterialCreateInputSchema'
import { WorksheetMaterialUncheckedCreateInputSchema } from '../inputTypeSchemas/WorksheetMaterialUncheckedCreateInputSchema'
import { WorksheetMaterialUpdateInputSchema } from '../inputTypeSchemas/WorksheetMaterialUpdateInputSchema'
import { WorksheetMaterialUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorksheetMaterialUncheckedUpdateInputSchema'
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

export const WorksheetMaterialUpsertArgsSchema: z.ZodType<Prisma.WorksheetMaterialUpsertArgs> = z.object({
  select: WorksheetMaterialSelectSchema.optional(),
  include: z.lazy(() => WorksheetMaterialIncludeSchema).optional(),
  where: WorksheetMaterialWhereUniqueInputSchema,
  create: z.union([ WorksheetMaterialCreateInputSchema,WorksheetMaterialUncheckedCreateInputSchema ]),
  update: z.union([ WorksheetMaterialUpdateInputSchema,WorksheetMaterialUncheckedUpdateInputSchema ]),
}).strict() ;

export default WorksheetMaterialUpsertArgsSchema;
