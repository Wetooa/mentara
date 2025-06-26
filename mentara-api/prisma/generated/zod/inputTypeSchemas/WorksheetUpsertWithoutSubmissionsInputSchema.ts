import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetUpdateWithoutSubmissionsInputSchema } from './WorksheetUpdateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedUpdateWithoutSubmissionsInputSchema } from './WorksheetUncheckedUpdateWithoutSubmissionsInputSchema';
import { WorksheetCreateWithoutSubmissionsInputSchema } from './WorksheetCreateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedCreateWithoutSubmissionsInputSchema } from './WorksheetUncheckedCreateWithoutSubmissionsInputSchema';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';

export const WorksheetUpsertWithoutSubmissionsInputSchema: z.ZodType<Prisma.WorksheetUpsertWithoutSubmissionsInput> = z.object({
  update: z.union([ z.lazy(() => WorksheetUpdateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutSubmissionsInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutSubmissionsInputSchema) ]),
  where: z.lazy(() => WorksheetWhereInputSchema).optional()
}).strict();

export default WorksheetUpsertWithoutSubmissionsInputSchema;
