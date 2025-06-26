import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"

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

export default WorksheetMaterialSelectSchema;
