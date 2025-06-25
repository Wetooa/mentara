import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialWhereUniqueInputSchema } from './WorksheetMaterialWhereUniqueInputSchema';
import { WorksheetMaterialCreateWithoutWorksheetInputSchema } from './WorksheetMaterialCreateWithoutWorksheetInputSchema';
import { WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema';

export const WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialCreateOrConnectWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetMaterialCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetMaterialCreateOrConnectWithoutWorksheetInputSchema;
