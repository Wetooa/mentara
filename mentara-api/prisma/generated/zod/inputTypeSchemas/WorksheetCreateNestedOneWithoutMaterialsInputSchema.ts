import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutMaterialsInputSchema } from './WorksheetCreateWithoutMaterialsInputSchema';
import { WorksheetUncheckedCreateWithoutMaterialsInputSchema } from './WorksheetUncheckedCreateWithoutMaterialsInputSchema';
import { WorksheetCreateOrConnectWithoutMaterialsInputSchema } from './WorksheetCreateOrConnectWithoutMaterialsInputSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';

export const WorksheetCreateNestedOneWithoutMaterialsInputSchema: z.ZodType<Prisma.WorksheetCreateNestedOneWithoutMaterialsInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutMaterialsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => WorksheetCreateOrConnectWithoutMaterialsInputSchema).optional(),
  connect: z.lazy(() => WorksheetWhereUniqueInputSchema).optional()
}).strict();

export default WorksheetCreateNestedOneWithoutMaterialsInputSchema;
