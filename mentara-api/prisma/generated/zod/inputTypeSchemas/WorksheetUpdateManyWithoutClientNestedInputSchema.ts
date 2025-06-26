import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutClientInputSchema } from './WorksheetCreateWithoutClientInputSchema';
import { WorksheetUncheckedCreateWithoutClientInputSchema } from './WorksheetUncheckedCreateWithoutClientInputSchema';
import { WorksheetCreateOrConnectWithoutClientInputSchema } from './WorksheetCreateOrConnectWithoutClientInputSchema';
import { WorksheetUpsertWithWhereUniqueWithoutClientInputSchema } from './WorksheetUpsertWithWhereUniqueWithoutClientInputSchema';
import { WorksheetCreateManyClientInputEnvelopeSchema } from './WorksheetCreateManyClientInputEnvelopeSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateWithWhereUniqueWithoutClientInputSchema } from './WorksheetUpdateWithWhereUniqueWithoutClientInputSchema';
import { WorksheetUpdateManyWithWhereWithoutClientInputSchema } from './WorksheetUpdateManyWithWhereWithoutClientInputSchema';
import { WorksheetScalarWhereInputSchema } from './WorksheetScalarWhereInputSchema';

export const WorksheetUpdateManyWithoutClientNestedInputSchema: z.ZodType<Prisma.WorksheetUpdateManyWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutClientInputSchema),z.lazy(() => WorksheetCreateWithoutClientInputSchema).array(),z.lazy(() => WorksheetUncheckedCreateWithoutClientInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetCreateOrConnectWithoutClientInputSchema),z.lazy(() => WorksheetCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WorksheetUpsertWithWhereUniqueWithoutClientInputSchema),z.lazy(() => WorksheetUpsertWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetCreateManyClientInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WorksheetUpdateWithWhereUniqueWithoutClientInputSchema),z.lazy(() => WorksheetUpdateWithWhereUniqueWithoutClientInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WorksheetUpdateManyWithWhereWithoutClientInputSchema),z.lazy(() => WorksheetUpdateManyWithWhereWithoutClientInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WorksheetScalarWhereInputSchema),z.lazy(() => WorksheetScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default WorksheetUpdateManyWithoutClientNestedInputSchema;
