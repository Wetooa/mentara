import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateWithoutClientInputSchema } from './WorksheetUpdateWithoutClientInputSchema';
import { WorksheetUncheckedUpdateWithoutClientInputSchema } from './WorksheetUncheckedUpdateWithoutClientInputSchema';

export const WorksheetUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.WorksheetUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WorksheetUpdateWithoutClientInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default WorksheetUpdateWithWhereUniqueWithoutClientInputSchema;
