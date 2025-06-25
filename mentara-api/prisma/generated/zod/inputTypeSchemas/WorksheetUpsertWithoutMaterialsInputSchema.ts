import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetUpdateWithoutMaterialsInputSchema } from './WorksheetUpdateWithoutMaterialsInputSchema';
import { WorksheetUncheckedUpdateWithoutMaterialsInputSchema } from './WorksheetUncheckedUpdateWithoutMaterialsInputSchema';
import { WorksheetCreateWithoutMaterialsInputSchema } from './WorksheetCreateWithoutMaterialsInputSchema';
import { WorksheetUncheckedCreateWithoutMaterialsInputSchema } from './WorksheetUncheckedCreateWithoutMaterialsInputSchema';
import { WorksheetWhereInputSchema } from './WorksheetWhereInputSchema';

export const WorksheetUpsertWithoutMaterialsInputSchema: z.ZodType<Prisma.WorksheetUpsertWithoutMaterialsInput> = z.object({
  update: z.union([ z.lazy(() => WorksheetUpdateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutMaterialsInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutMaterialsInputSchema) ]),
  where: z.lazy(() => WorksheetWhereInputSchema).optional()
}).strict();

export default WorksheetUpsertWithoutMaterialsInputSchema;
