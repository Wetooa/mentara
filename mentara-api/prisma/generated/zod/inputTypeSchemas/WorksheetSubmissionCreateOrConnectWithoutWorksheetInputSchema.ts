import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema';

export const WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateOrConnectWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema;
