import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"

export const WorksheetMaterialSelectSchema: z.ZodType<Prisma.WorksheetMaterialSelect> = z.object({
  id: z.boolean().optional(),
  worksheetId: z.boolean().optional(),
  url: z.boolean().optional(),
  type: z.boolean().optional(),
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
}).strict()

export default WorksheetMaterialSelectSchema;
