import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutPreAssessmentInputSchema } from './ClientCreateWithoutPreAssessmentInputSchema';
import { ClientUncheckedCreateWithoutPreAssessmentInputSchema } from './ClientUncheckedCreateWithoutPreAssessmentInputSchema';
import { ClientCreateOrConnectWithoutPreAssessmentInputSchema } from './ClientCreateOrConnectWithoutPreAssessmentInputSchema';
import { ClientUpsertWithoutPreAssessmentInputSchema } from './ClientUpsertWithoutPreAssessmentInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutPreAssessmentInputSchema } from './ClientUpdateToOneWithWhereWithoutPreAssessmentInputSchema';
import { ClientUpdateWithoutPreAssessmentInputSchema } from './ClientUpdateWithoutPreAssessmentInputSchema';
import { ClientUncheckedUpdateWithoutPreAssessmentInputSchema } from './ClientUncheckedUpdateWithoutPreAssessmentInputSchema';

export const ClientUpdateOneRequiredWithoutPreAssessmentNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutPreAssessmentNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedCreateWithoutPreAssessmentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutPreAssessmentInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutPreAssessmentInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutPreAssessmentInputSchema),z.lazy(() => ClientUpdateWithoutPreAssessmentInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutPreAssessmentInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutPreAssessmentNestedInputSchema;
