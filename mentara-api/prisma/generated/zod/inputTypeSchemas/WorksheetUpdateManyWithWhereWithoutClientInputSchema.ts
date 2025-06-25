import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetScalarWhereInputSchema } from './WorksheetScalarWhereInputSchema';
import { WorksheetUpdateManyMutationInputSchema } from './WorksheetUpdateManyMutationInputSchema';
import { WorksheetUncheckedUpdateManyWithoutClientInputSchema } from './WorksheetUncheckedUpdateManyWithoutClientInputSchema';

export const WorksheetUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.WorksheetUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WorksheetUpdateManyMutationInputSchema),z.lazy(() => WorksheetUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default WorksheetUpdateManyWithWhereWithoutClientInputSchema;
