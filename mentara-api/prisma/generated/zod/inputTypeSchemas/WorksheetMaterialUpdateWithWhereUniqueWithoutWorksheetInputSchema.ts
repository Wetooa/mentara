import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialWhereUniqueInputSchema } from './WorksheetMaterialWhereUniqueInputSchema';
import { WorksheetMaterialUpdateWithoutWorksheetInputSchema } from './WorksheetMaterialUpdateWithoutWorksheetInputSchema';
import { WorksheetMaterialUncheckedUpdateWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedUpdateWithoutWorksheetInputSchema';

export const WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetMaterialWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WorksheetMaterialUpdateWithoutWorksheetInputSchema),z.lazy(() => WorksheetMaterialUncheckedUpdateWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetMaterialUpdateWithWhereUniqueWithoutWorksheetInputSchema;
