import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentCreateWithoutClientInputSchema } from './PreAssessmentCreateWithoutClientInputSchema';
import { PreAssessmentUncheckedCreateWithoutClientInputSchema } from './PreAssessmentUncheckedCreateWithoutClientInputSchema';
import { PreAssessmentCreateOrConnectWithoutClientInputSchema } from './PreAssessmentCreateOrConnectWithoutClientInputSchema';
import { PreAssessmentWhereUniqueInputSchema } from './PreAssessmentWhereUniqueInputSchema';

export const PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema: z.ZodType<Prisma.PreAssessmentUncheckedCreateNestedOneWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => PreAssessmentCreateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedCreateWithoutClientInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PreAssessmentCreateOrConnectWithoutClientInputSchema).optional(),
  connect: z.lazy(() => PreAssessmentWhereUniqueInputSchema).optional()
}).strict();

export default PreAssessmentUncheckedCreateNestedOneWithoutClientInputSchema;
