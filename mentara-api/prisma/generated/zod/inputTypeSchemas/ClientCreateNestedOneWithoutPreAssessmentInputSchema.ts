import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutPreAssessmentInputSchema } from './ClientCreateWithoutPreAssessmentInputSchema';
import { ClientUncheckedCreateWithoutPreAssessmentInputSchema } from './ClientUncheckedCreateWithoutPreAssessmentInputSchema';
import { ClientCreateOrConnectWithoutPreAssessmentInputSchema } from './ClientCreateOrConnectWithoutPreAssessmentInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutPreAssessmentInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutPreAssessmentInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedCreateWithoutPreAssessmentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutPreAssessmentInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutPreAssessmentInputSchema;
