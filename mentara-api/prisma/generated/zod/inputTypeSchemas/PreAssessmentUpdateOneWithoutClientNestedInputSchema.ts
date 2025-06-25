import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PreAssessmentCreateWithoutClientInputSchema } from './PreAssessmentCreateWithoutClientInputSchema';
import { PreAssessmentUncheckedCreateWithoutClientInputSchema } from './PreAssessmentUncheckedCreateWithoutClientInputSchema';
import { PreAssessmentCreateOrConnectWithoutClientInputSchema } from './PreAssessmentCreateOrConnectWithoutClientInputSchema';
import { PreAssessmentUpsertWithoutClientInputSchema } from './PreAssessmentUpsertWithoutClientInputSchema';
import { PreAssessmentWhereInputSchema } from './PreAssessmentWhereInputSchema';
import { PreAssessmentWhereUniqueInputSchema } from './PreAssessmentWhereUniqueInputSchema';
import { PreAssessmentUpdateToOneWithWhereWithoutClientInputSchema } from './PreAssessmentUpdateToOneWithWhereWithoutClientInputSchema';
import { PreAssessmentUpdateWithoutClientInputSchema } from './PreAssessmentUpdateWithoutClientInputSchema';
import { PreAssessmentUncheckedUpdateWithoutClientInputSchema } from './PreAssessmentUncheckedUpdateWithoutClientInputSchema';

export const PreAssessmentUpdateOneWithoutClientNestedInputSchema: z.ZodType<Prisma.PreAssessmentUpdateOneWithoutClientNestedInput> = z.object({
  create: z.union([ z.lazy(() => PreAssessmentCreateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedCreateWithoutClientInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PreAssessmentCreateOrConnectWithoutClientInputSchema).optional(),
  upsert: z.lazy(() => PreAssessmentUpsertWithoutClientInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => PreAssessmentWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => PreAssessmentWhereInputSchema) ]).optional(),
  connect: z.lazy(() => PreAssessmentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PreAssessmentUpdateToOneWithWhereWithoutClientInputSchema),z.lazy(() => PreAssessmentUpdateWithoutClientInputSchema),z.lazy(() => PreAssessmentUncheckedUpdateWithoutClientInputSchema) ]).optional(),
}).strict();

export default PreAssessmentUpdateOneWithoutClientNestedInputSchema;
