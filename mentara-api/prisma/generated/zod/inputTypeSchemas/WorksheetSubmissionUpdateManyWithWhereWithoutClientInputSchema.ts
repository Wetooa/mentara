import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionScalarWhereInputSchema } from './WorksheetSubmissionScalarWhereInputSchema';
import { WorksheetSubmissionUpdateManyMutationInputSchema } from './WorksheetSubmissionUpdateManyMutationInputSchema';
import { WorksheetSubmissionUncheckedUpdateManyWithoutClientInputSchema } from './WorksheetSubmissionUncheckedUpdateManyWithoutClientInputSchema';

export const WorksheetSubmissionUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WorksheetSubmissionUpdateManyMutationInputSchema),z.lazy(() => WorksheetSubmissionUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default WorksheetSubmissionUpdateManyWithWhereWithoutClientInputSchema;
