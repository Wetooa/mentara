import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';
import { WorksheetUpdateWithoutTherapistInputSchema } from './WorksheetUpdateWithoutTherapistInputSchema';
import { WorksheetUncheckedUpdateWithoutTherapistInputSchema } from './WorksheetUncheckedUpdateWithoutTherapistInputSchema';
import { WorksheetCreateWithoutTherapistInputSchema } from './WorksheetCreateWithoutTherapistInputSchema';
import { WorksheetUncheckedCreateWithoutTherapistInputSchema } from './WorksheetUncheckedCreateWithoutTherapistInputSchema';

export const WorksheetUpsertWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetUpsertWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => WorksheetWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => WorksheetUpdateWithoutTherapistInputSchema),z.lazy(() => WorksheetUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => WorksheetCreateWithoutTherapistInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default WorksheetUpsertWithWhereUniqueWithoutTherapistInputSchema;
