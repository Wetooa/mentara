import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { WorksheetMaterialSelectSchema } from '../inputTypeSchemas/WorksheetMaterialSelectSchema';
import { WorksheetMaterialIncludeSchema } from '../inputTypeSchemas/WorksheetMaterialIncludeSchema';

export const WorksheetMaterialArgsSchema: z.ZodType<Prisma.WorksheetMaterialDefaultArgs> = z.object({
  select: z.lazy(() => WorksheetMaterialSelectSchema).optional(),
  include: z.lazy(() => WorksheetMaterialIncludeSchema).optional(),
}).strict();

export default WorksheetMaterialArgsSchema;
