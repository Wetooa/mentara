import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionScalarWhereInputSchema } from './WorksheetSubmissionScalarWhereInputSchema';
import { WorksheetSubmissionUpdateManyMutationInputSchema } from './WorksheetSubmissionUpdateManyMutationInputSchema';
import { WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetInputSchema';

export const WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WorksheetSubmissionUpdateManyMutationInputSchema),z.lazy(() => WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInputSchema;
