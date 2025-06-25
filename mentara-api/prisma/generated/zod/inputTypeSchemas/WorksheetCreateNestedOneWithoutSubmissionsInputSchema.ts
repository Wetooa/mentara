import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutSubmissionsInputSchema } from './WorksheetCreateWithoutSubmissionsInputSchema';
import { WorksheetUncheckedCreateWithoutSubmissionsInputSchema } from './WorksheetUncheckedCreateWithoutSubmissionsInputSchema';
import { WorksheetCreateOrConnectWithoutSubmissionsInputSchema } from './WorksheetCreateOrConnectWithoutSubmissionsInputSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';

export const WorksheetCreateNestedOneWithoutSubmissionsInputSchema: z.ZodType<Prisma.WorksheetCreateNestedOneWithoutSubmissionsInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutSubmissionsInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutSubmissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => WorksheetCreateOrConnectWithoutSubmissionsInputSchema).optional(),
  connect: z.lazy(() => WorksheetWhereUniqueInputSchema).optional()
}).strict();

export default WorksheetCreateNestedOneWithoutSubmissionsInputSchema;
