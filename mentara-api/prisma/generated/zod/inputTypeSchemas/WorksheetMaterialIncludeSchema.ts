import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetArgsSchema } from "../outputTypeSchemas/WorksheetArgsSchema"

export const WorksheetMaterialIncludeSchema: z.ZodType<Prisma.WorksheetMaterialInclude> = z.object({
  worksheet: z.union([z.boolean(),z.lazy(() => WorksheetArgsSchema)]).optional(),
}).strict()

export default WorksheetMaterialIncludeSchema;
