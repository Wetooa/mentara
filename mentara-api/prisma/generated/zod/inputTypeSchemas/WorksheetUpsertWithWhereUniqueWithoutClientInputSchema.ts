import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateWithoutClientInputSchema } from './WorksheetUpdateWithoutClientInputSchema';
import { WorksheetUncheckedUpdateWithoutClientInputSchema } from './WorksheetUncheckedUpdateWithoutClientInputSchema';
import { WorksheetCreateWithoutClientInputSchema } from './WorksheetCreateWithoutClientInputSchema';
import { WorksheetUncheckedCreateWithoutClientInputSchema } from './WorksheetUncheckedCreateWithoutClientInputSchema';

export const WorksheetUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.WorksheetUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => WorksheetUpdateWithoutClientInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutClientInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default WorksheetUpsertWithWhereUniqueWithoutClientInputSchema;
