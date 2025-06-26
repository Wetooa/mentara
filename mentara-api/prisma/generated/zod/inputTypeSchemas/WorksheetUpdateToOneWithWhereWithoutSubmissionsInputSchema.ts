import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';
import { WorksheetUpdateWithoutSubmissionsInputSchema } from './WorksheetUpdateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedUpdateWithoutSubmissionsInputSchema } from './WorksheetUncheckedUpdateWithoutSubmissionsInputSchema';

export const WorksheetUpdateToOneWithWhereWithoutSubmissionsInputSchema: z.ZodType<Prisma.WorksheetUpdateToOneWithWhereWithoutSubmissionsInput> = z.object({
  where: z.lazy(() => WorksheetWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => WorksheetUpdateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutSubmissionsInputSchema) ]),
}).strict();

export default WorksheetUpdateToOneWithWhereWithoutSubmissionsInputSchema;
