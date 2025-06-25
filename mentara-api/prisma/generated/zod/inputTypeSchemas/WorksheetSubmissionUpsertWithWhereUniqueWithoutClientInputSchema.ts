import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionUpdateWithoutClientInputSchema } from './WorksheetSubmissionUpdateWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedUpdateWithoutClientInputSchema } from './WorksheetSubmissionUncheckedUpdateWithoutClientInputSchema';
import { WorksheetSubmissionCreateWithoutClientInputSchema } from './WorksheetSubmissionCreateWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutClientInputSchema';

export const WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => WorksheetSubmissionUpdateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInputSchema;
