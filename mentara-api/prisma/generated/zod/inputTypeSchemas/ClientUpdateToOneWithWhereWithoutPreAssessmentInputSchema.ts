import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutPreAssessmentInputSchema } from './ClientUpdateWithoutPreAssessmentInputSchema';
import { ClientUncheckedUpdateWithoutPreAssessmentInputSchema } from './ClientUncheckedUpdateWithoutPreAssessmentInputSchema';

export const ClientUpdateToOneWithWhereWithoutPreAssessmentInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutPreAssessmentInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutPreAssessmentInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutPreAssessmentInputSchema;
