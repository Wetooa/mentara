import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutTherapistInputSchema } from './WorksheetCreateWithoutTherapistInputSchema';
import { WorksheetUncheckedCreateWithoutTherapistInputSchema } from './WorksheetUncheckedCreateWithoutTherapistInputSchema';
import { WorksheetCreateOrConnectWithoutTherapistInputSchema } from './WorksheetCreateOrConnectWithoutTherapistInputSchema';
import { WorksheetUpsertWithWhereUniqueWithoutTherapistInputSchema } from './WorksheetUpsertWithWhereUniqueWithoutTherapistInputSchema';
import { WorksheetCreateManyTherapistInputEnvelopeSchema } from './WorksheetCreateManyTherapistInputEnvelopeSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateWithWhereUniqueWithoutTherapistInputSchema } from './WorksheetUpdateWithWhereUniqueWithoutTherapistInputSchema';
import { WorksheetUpdateManyWithWhereWithoutTherapistInputSchema } from './WorksheetUpdateManyWithWhereWithoutTherapistInputSchema';
import { WorksheetScalarWhereInputSchema } from './WorksheetScalarWhereInputSchema';

export const WorksheetUpdateManyWithoutTherapistNestedInputSchema: z.ZodType<Prisma.WorksheetUpdateManyWithoutTherapistNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutTherapistInputSchema),z.lazy(() => WorksheetCreateWithoutTherapistInputSchema).array(),z.lazy(() => WorksheetUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => WorksheetCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WorksheetUpsertWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => WorksheetUpsertWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetCreateManyTherapistInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WorksheetUpdateWithWhereUniqueWithoutTherapistInputSchema),z.lazy(() => WorksheetUpdateWithWhereUniqueWithoutTherapistInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WorksheetUpdateManyWithWhereWithoutTherapistInputSchema),z.lazy(() => WorksheetUpdateManyWithWhereWithoutTherapistInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WorksheetScalarWhereInputSchema),z.lazy(() => WorksheetScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default WorksheetUpdateManyWithoutTherapistNestedInputSchema;
