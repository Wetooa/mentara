import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionUpdateWithoutClientInputSchema } from './WorksheetSubmissionUpdateWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedUpdateWithoutClientInputSchema } from './WorksheetSubmissionUncheckedUpdateWithoutClientInputSchema';

export const WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WorksheetSubmissionUpdateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInputSchema;
