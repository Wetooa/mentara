import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentUpdateWithoutClientInputSchema } from './PreAssessmentUpdateWithoutClientInputSchema';
import { PreAssessmentUncheckedUpdateWithoutClientInputSchema } from './PreAssessmentUncheckedUpdateWithoutClientInputSchema';
import { PreAssessmentCreateWithoutClientInputSchema } from './PreAssessmentCreateWithoutClientInputSchema';
import { PreAssessmentUncheckedCreateWithoutClientInputSchema } from './PreAssessmentUncheckedCreateWithoutClientInputSchema';
import { PreAssessmentWhereInputSchema } from './PreAssessmentWhereInputSchema';

export const PreAssessmentUpsertWithoutClientInputSchema: z.ZodType<Prisma.PreAssessmentUpsertWithoutClientInput> = z.object({
  update: z.union([ z.lazy(() => PreAssessmentUpdateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => PreAssessmentCreateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedCreateWithoutClientInputSchema) ]),
  where: z.lazy(() => PreAssessmentWhereInputSchema).optional()
}).strict();

export default PreAssessmentUpsertWithoutClientInputSchema;
