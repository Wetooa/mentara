import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionUpdateWithoutWorksheetInputSchema } from './WorksheetSubmissionUpdateWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedUpdateWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedUpdateWithoutWorksheetInputSchema';
import { WorksheetSubmissionCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema';

export const WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => WorksheetSubmissionUpdateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUncheckedUpdateWithoutWorksheetInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInputSchema;
