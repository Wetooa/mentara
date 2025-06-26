import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialWhereUniqueInputSchema } from './WorksheetMaterialWhereUniqueInputSchema';
import { WorksheetMaterialUpdateWithoutWorksheetInputSchema } from './WorksheetMaterialUpdateWithoutWorksheetInputSchema';
import { WorksheetMaterialUncheckedUpdateWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedUpdateWithoutWorksheetInputSchema';
import { WorksheetMaterialCreateWithoutWorksheetInputSchema } from './WorksheetMaterialCreateWithoutWorksheetInputSchema';
import { WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema';

export const WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => WorksheetMaterialUpdateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUncheckedUpdateWithoutWorksheetInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetMaterialCreateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUncheckedCreateWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetMaterialUpsertWithWhereUniqueWithoutWorksheetInputSchema;
