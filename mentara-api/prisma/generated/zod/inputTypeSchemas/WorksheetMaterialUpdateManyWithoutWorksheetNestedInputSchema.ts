import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialCreateWithoutWorksheetInputSchema } from './WorksheetMaterialCreateWithoutWorksheetInputSchema';
import { WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema';
import { WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema } from './WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema';
import { WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInputSchema } from './WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInputSchema';
import { WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema } from './WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema';
import { WorksheetMaterialWhereUniqueInputSchema } from './WorksheetMaterialWhereUniqueInputSchema';
import { WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInputSchema } from './WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInputSchema';
import { WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInputSchema } from './WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInputSchema';
import { WorksheetMaterialScalarWhereInputSchema } from './WorksheetMaterialScalarWhereInputSchema';

export const WorksheetMaterialUpdateManyWithoutWorksheetNestedInputSchema: z.ZodType<Prisma.WorksheetMaterialUpdateManyWithoutWorksheetNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetMaterialCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialCreateWithoutWorksheetInputSchema).array(),z.lazy(() => WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),z.lazy(() => WorksheetMaterialWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),z.lazy(() => WorksheetMaterialWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),z.lazy(() => WorksheetMaterialWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),z.lazy(() => WorksheetMaterialWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => WorksheetMaterialScalarWhereInputSchema),z.lazy(() => WorksheetMaterialScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default WorksheetMaterialUpdateManyWithoutWorksheetNestedInputSchema;
