import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetCreateWithoutTherapistInputSchema } from './WorksheetCreateWithoutTherapistInputSchema';
import { WorksheetUncheckedCreateWithoutTherapistInputSchema } from './WorksheetUncheckedCreateWithoutTherapistInputSchema';

export const WorksheetCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutTherapistInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default WorksheetCreateOrConnectWithoutTherapistInputSchema;
