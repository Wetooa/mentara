import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutPreAssessmentInputSchema } from './ClientCreateWithoutPreAssessmentInputSchema';
import { ClientUncheckedCreateWithoutPreAssessmentInputSchema } from './ClientUncheckedCreateWithoutPreAssessmentInputSchema';

export const ClientCreateOrConnectWithoutPreAssessmentInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutPreAssessmentInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedCreateWithoutPreAssessmentInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutPreAssessmentInputSchema;
