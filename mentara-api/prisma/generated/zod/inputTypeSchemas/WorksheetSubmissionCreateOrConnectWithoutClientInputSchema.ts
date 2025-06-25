import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionCreateWithoutClientInputSchema } from './WorksheetSubmissionCreateWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutClientInputSchema';

export const WorksheetSubmissionCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default WorksheetSubmissionCreateOrConnectWithoutClientInputSchema;
