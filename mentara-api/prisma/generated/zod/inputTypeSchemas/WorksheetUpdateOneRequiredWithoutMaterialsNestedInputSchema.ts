import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutMaterialsInputSchema } from './WorksheetCreateWithoutMaterialsInputSchema';
import { WorksheetUncheckedCreateWithoutMaterialsInputSchema } from './WorksheetUncheckedCreateWithoutMaterialsInputSchema';
import { WorksheetCreateOrConnectWithoutMaterialsInputSchema } from './WorksheetCreateOrConnectWithoutMaterialsInputSchema';
import { WorksheetUpsertWithoutMaterialsInputSchema } from './WorksheetUpsertWithoutMaterialsInputSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateToOneWithWhereWithoutMaterialsInputSchema } from './WorksheetUpdateToOneWithWhereWithoutMaterialsInputSchema';
import { WorksheetUpdateWithoutMaterialsInputSchema } from './WorksheetUpdateWithoutMaterialsInputSchema';
import { WorksheetUncheckedUpdateWithoutMaterialsInputSchema } from './WorksheetUncheckedUpdateWithoutMaterialsInputSchema';

export const WorksheetUpdateOneRequiredWithoutMaterialsNestedInputSchema: z.ZodType<Prisma.WorksheetUpdateOneRequiredWithoutMaterialsNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutMaterialsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => WorksheetCreateOrConnectWithoutMaterialsInputSchema).optional(),
  upsert: z.lazy(() => WorksheetUpsertWithoutMaterialsInputSchema).optional(),
  connect: z.lazy(() => WorksheetWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => WorksheetUpdateToOneWithWhereWithoutMaterialsInputSchema),z.lazy(() => WorksheetUpdateWithoutMaterialsInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutMaterialsInputSchema) ]).optional(),
}).strict();

export default WorksheetUpdateOneRequiredWithoutMaterialsNestedInputSchema;
