import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetSubmissionCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateWithoutWorksheetInputSchema';
import { WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema';
import { WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema } from './WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema';
import { WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInputSchema } from './WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInputSchema';
import { WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema } from './WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema';
import { WorksheetSubmissionWhereUniqueInputSchema } from './WorksheetSubmissionWhereUniqueInputSchema';
import { WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInputSchema } from './WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInputSchema';
import { WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInputSchema } from './WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInputSchema';
import { WorksheetSubmissionScalarWhereInputSchema } from './WorksheetSubmissionScalarWhereInputSchema';

export const WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetNestedInputSchema: z.ZodType<Prisma.WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetSubmissionCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionCreateWithoutWorksheetInputSchema).array(),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUncheckedCreateWithoutWorksheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionCreateOrConnectWithoutWorksheetInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUpsertWithWhereUniqueWithoutWorksheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetSubmissionCreateManyWorksheetInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema),z.lazy(() => WorksheetSubmissionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUpdateWithWhereUniqueWithoutWorksheetInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInputSchema),z.lazy(() => WorksheetSubmissionUpdateManyWithWhereWithoutWorksheetInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WorksheetSubmissionScalarWhereInputSchema),z.lazy(() => WorksheetSubmissionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default WorksheetSubmissionUncheckedUpdateManyWithoutWorksheetNestedInputSchema;
