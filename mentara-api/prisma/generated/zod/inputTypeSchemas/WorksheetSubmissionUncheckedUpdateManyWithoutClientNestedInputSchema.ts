import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateWithoutClientInputSchema } from './WorksheetSubmissionCreateWithoutClientInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutClientInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutClientInputSchema';
import { WorksheetSubmissionCreateOrConnectWithoutClientInputSchema } from './WorksheetSubmissionCreateOrConnectWithoutClientInputSchema';
import { WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInputSchema } from './WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInputSchema';
import { WorksheetSubmissionCreateManyClientInputEnvelopeSchema } from './WorksheetSubmissionCreateManyClientInputEnvelopeSchema';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInputSchema } from './WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInputSchema';
import { WorksheetSubmissionUpdateManyWithWhereWithoutClientInputSchema } from './WorksheetSubmissionUpdateManyWithWhereWithoutClientInputSchema';
import { WorksheetSubmissionScalarWhereInputSchema } from './WorksheetSubmissionScalarWhereInputSchema';

export const WorksheetSubmissionUncheckedUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.WorksheetSubmissionUncheckedUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionCreateWithoutClientInputSchema).array(),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetSubmissionCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WorksheetSubmissionUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => WorksheetSubmissionUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default WorksheetSubmissionUncheckedUpdateManyWithoutClientNestedInputSchema;
