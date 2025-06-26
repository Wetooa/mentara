import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutSubmissionsInputSchema } from './WorksheetCreateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedCreateWithoutSubmissionsInputSchema } from './WorksheetUncheckedCreateWithoutSubmissionsInputSchema';
import { WorksheetCreateOrConnectWithoutSubmissionsInputSchema } from './WorksheetCreateOrConnectWithoutSubmissionsInputSchema';
import { WorksheetUpsertWithoutSubmissionsInputSchema } from './WorksheetUpsertWithoutSubmissionsInputSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateToOneWithWhereWithoutSubmissionsInputSchema } from './WorksheetUpdateToOneWithWhereWithoutSubmissionsInputSchema';
import { WorksheetUpdateWithoutSubmissionsInputSchema } from './WorksheetUpdateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedUpdateWithoutSubmissionsInputSchema } from './WorksheetUncheckedUpdateWithoutSubmissionsInputSchema';

export const WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema: z.ZodType<Prisma.WorksheetUpdateOneRequiredWithoutSubmissionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutSubmissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => WorksheetCreateOrConnectWithoutSubmissionsInputSchema).optional(),
  upsert: z.lazy(() => WorksheetUpsertWithoutSubmissionsInputSchema).optional(),
  connect: z.lazy(() => WorksheetWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => WorksheetUpdateToOneWithWhereWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUpdateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutSubmissionsInputSchema) ]).optional(),
}).strict();

export default WorksheetUpdateOneRequiredWithoutSubmissionsNestedInputSchema;
