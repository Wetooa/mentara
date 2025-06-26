import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema';
import { WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema';
import { WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema } from './WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';

export const WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionCreateWithoutWorksheetInputSchema).array(),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default WorksheetSubmissionUncheckedCreateNestedManyWithoutWorksheetInputSchema;
