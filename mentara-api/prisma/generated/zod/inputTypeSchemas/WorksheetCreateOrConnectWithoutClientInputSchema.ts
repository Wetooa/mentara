import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetCreateWithoutClientInputSchema } from './WorksheetCreateWithoutClientInputSchema';
import { WorksheetUncheckedCreateWithoutClientInputSchema } from './WorksheetUncheckedCreateWithoutClientInputSchema';

export const WorksheetCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.WorksheetCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutClientInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default WorksheetCreateOrConnectWithoutClientInputSchema;
