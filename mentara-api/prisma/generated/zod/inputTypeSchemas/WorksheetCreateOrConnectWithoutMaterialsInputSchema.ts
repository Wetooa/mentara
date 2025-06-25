import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetCreateWithoutMaterialsInputSchema } from './WorksheetCreateWithoutMaterialsInputSchema';
import { WorksheetUncheckedCreateWithoutMaterialsInputSchema } from './WorksheetUncheckedCreateWithoutMaterialsInputSchema';

export const WorksheetCreateOrConnectWithoutMaterialsInputSchema: z.ZodType<Prisma.WorksheetCreateOrConnectWithoutMaterialsInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutMaterialsInputSchema) ]),
}).strict();

export default WorksheetCreateOrConnectWithoutMaterialsInputSchema;
