import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialCreateWithoutWorksheetInputSchema } from './WorksheetMaterialCreateWithoutWorksheetInputSchema';
import { WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema';
import { WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema } from './WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema';
import { WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema } from './WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema';
import { WorksheetMaterialWhereUniqueInputSchema } from './WorksheetMaterialWhereUniqueInputSchema';

export const WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetMaterialCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialCreateWithoutWorksheetInputSchema).array(),z.lazy(() => WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),z.lazy(() => WorksheetMaterialWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default WorksheetMaterialUncheckedCreateNestedManyWithoutWorksheetInputSchema;
