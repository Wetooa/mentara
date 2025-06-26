import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentWhereInputSchema } from './PreAssessmentWhereInputSchema';
import { PreAssessmentUpdateWithoutClientInputSchema } from './PreAssessmentUpdateWithoutClientInputSchema';
import { PreAssessmentUncheckedUpdateWithoutClientInputSchema } from './PreAssessmentUncheckedUpdateWithoutClientInputSchema';

export const PreAssessmentUpdateToOneWithWhereWithoutClientInputSchema: z.ZodType<Prisma.PreAssessmentUpdateToOneWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => PreAssessmentWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PreAssessmentUpdateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default PreAssessmentUpdateToOneWithWhereWithoutClientInputSchema;
