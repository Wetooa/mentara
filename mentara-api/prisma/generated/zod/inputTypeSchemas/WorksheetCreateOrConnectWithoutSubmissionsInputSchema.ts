import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetCreateWithoutSubmissionsInputSchema } from './WorksheetCreateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedCreateWithoutSubmissionsInputSchema } from './WorksheetUncheckedCreateWithoutSubmissionsInputSchema';

export const WorksheetCreateOrConnectWithoutSubmissionsInputSchema: z.ZodType<Prisma.WorksheetCreateOrConnectWithoutSubmissionsInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutSubmissionsInputSchema) ]),
}).strict();

export default WorksheetCreateOrConnectWithoutSubmissionsInputSchema;
