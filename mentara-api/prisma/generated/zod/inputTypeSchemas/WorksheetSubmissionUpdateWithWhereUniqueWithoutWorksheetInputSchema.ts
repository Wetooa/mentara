import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionUpdateWithoutWorksheetInputSchema } from './WorksheetSubmissionUpdateWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedUpdateWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedUpdateWithoutWorksheetInputSchema';

export const WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WorksheetSubmissionUpdateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUncheckedUpdateWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInputSchema;
