import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';
import { WorksheetUpdateWithoutMaterialsInputSchema } from './WorksheetUpdateWithoutMaterialsInputSchema';
import { WorksheetUncheckedUpdateWithoutMaterialsInputSchema } from './WorksheetUncheckedUpdateWithoutMaterialsInputSchema';

export const WorksheetUpdateToOneWithWhereWithoutMaterialsInputSchema: z.ZodType<Prisma.WorksheetUpdateToOneWithWhereWithoutMaterialsInput> = z.object({
  where: z.lazy(() => WorksheetWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => WorksheetUpdateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutMaterialsInputSchema) ]),
}).strict();

export default WorksheetUpdateToOneWithWhereWithoutMaterialsInputSchema;
