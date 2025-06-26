import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutPreAssessmentInputSchema } from './ClientUpdateWithoutPreAssessmentInputSchema';
import { ClientUncheckedUpdateWithoutPreAssessmentInputSchema } from './ClientUncheckedUpdateWithoutPreAssessmentInputSchema';
import { ClientCreateWithoutPreAssessmentInputSchema } from './ClientCreateWithoutPreAssessmentInputSchema';
import { ClientUncheckedCreateWithoutPreAssessmentInputSchema } from './ClientUncheckedCreateWithoutPreAssessmentInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutPreAssessmentInputSchema: z.ZodType<Prisma.ClientUpsertWithoutPreAssessmentInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutPreAssessmentInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedCreateWithoutPreAssessmentInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutPreAssessmentInputSchema;
