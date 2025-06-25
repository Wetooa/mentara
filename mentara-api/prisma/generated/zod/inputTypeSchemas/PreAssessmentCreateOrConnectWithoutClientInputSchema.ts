import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentWhereUniqueInputSchema } from './PreAssessmentWhereUniqueInputSchema';
import { PreAssessmentCreateWithoutClientInputSchema } from './PreAssessmentCreateWithoutClientInputSchema';
import { PreAssessmentUncheckedCreateWithoutClientInputSchema } from './PreAssessmentUncheckedCreateWithoutClientInputSchema';

export const PreAssessmentCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.PreAssessmentCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => PreAssessmentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PreAssessmentCreateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default PreAssessmentCreateOrConnectWithoutClientInputSchema;
