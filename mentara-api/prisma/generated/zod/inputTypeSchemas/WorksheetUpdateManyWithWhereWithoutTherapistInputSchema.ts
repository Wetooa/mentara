import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetScalarWhereInputSchema } from './WorksheetScalarWhereInputSchema';
import { WorksheetUpdateManyMutationInputSchema } from './WorksheetUpdateManyMutationInputSchema';
import { WorksheetUncheckedUpdateManyWithoutTherapistInputSchema } from './WorksheetUncheckedUpdateManyWithoutTherapistInputSchema';

export const WorksheetUpdateManyWithWhereWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetUpdateManyWithWhereWithoutTherapistInput> = z.object({
  where: z.lazy(() => WorksheetScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WorksheetUpdateManyMutationInputSchema),z.lazy(() => WorksheetUncheckedUpdateManyWithoutTherapistInputSchema) ]),
}).strict();

export default WorksheetUpdateManyWithWhereWithoutTherapistInputSchema;
