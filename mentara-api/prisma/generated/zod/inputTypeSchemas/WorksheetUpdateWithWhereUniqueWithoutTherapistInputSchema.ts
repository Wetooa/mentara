import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateWithoutTherapistInputSchema } from './WorksheetUpdateWithoutTherapistInputSchema';
import { WorksheetUncheckedUpdateWithoutTherapistInputSchema } from './WorksheetUncheckedUpdateWithoutTherapistInputSchema';

export const WorksheetUpdateWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetUpdateWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => WorksheetUpdateWithoutTherapistInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutTherapistInputSchema) ]),
}).strict();

export default WorksheetUpdateWithWhereUniqueWithoutTherapistInputSchema;
