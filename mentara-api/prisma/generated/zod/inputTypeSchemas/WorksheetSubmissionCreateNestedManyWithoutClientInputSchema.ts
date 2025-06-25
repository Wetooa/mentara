import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateWithoutClientInputSchema } from './WorksheetSubmissionCreateWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutClientInputSchema';
import { WorksheetSubmissionCreateOrConnectWithoutClientInputSchema } from './WorksheetSubmissionCreateOrConnectWithoutClientInputSchema';
import { WorksheetSubmissionCreateManyClientInputEnvelopeSchema } from './WorksheetSubmissionCreateManyClientInputEnvelopeSchema';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';

export const WorksheetSubmissionCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.WorksheetSubmissionCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionCreateWithoutClientInputSchema).array(),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetSubmissionCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default WorksheetSubmissionCreateNestedManyWithoutClientInputSchema;
