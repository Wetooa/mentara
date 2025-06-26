import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutClientInputSchema } from './WorksheetCreateWithoutClientInputSchema';
import { WorksheetUncheckedCreateWithoutClientInputSchema } from './WorksheetUncheckedCreateWithoutClientInputSchema';
import { WorksheetCreateOrConnectWithoutClientInputSchema } from './WorksheetCreateOrConnectWithoutClientInputSchema';
import { WorksheetCreateManyClientInputEnvelopeSchema } from './WorksheetCreateManyClientInputEnvelopeSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';

export const WorksheetCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.WorksheetCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutClientInputSchema),z.lazy(() => WorksheetCreateWithoutClientInputSchema).array(),z.lazy(() => WorksheetUncheckedCreateWithoutClientInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetCreateOrConnectWithoutClientInputSchema),z.lazy(() => WorksheetCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default WorksheetCreateNestedManyWithoutClientInputSchema;
