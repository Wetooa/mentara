import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutProcessedByAdminInputSchema } from './TherapistCreateWithoutProcessedByAdminInputSchema';
import { TherapistUncheckedCreateWithoutProcessedByAdminInputSchema } from './TherapistUncheckedCreateWithoutProcessedByAdminInputSchema';
import { TherapistCreateOrConnectWithoutProcessedByAdminInputSchema } from './TherapistCreateOrConnectWithoutProcessedByAdminInputSchema';
import { TherapistCreateManyProcessedByAdminInputEnvelopeSchema } from './TherapistCreateManyProcessedByAdminInputEnvelopeSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistUncheckedCreateNestedManyWithoutProcessedByAdminInputSchema: z.ZodType<Prisma.TherapistUncheckedCreateNestedManyWithoutProcessedByAdminInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistCreateWithoutProcessedByAdminInputSchema).array(),z.lazy(() => TherapistUncheckedCreateWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutProcessedByAdminInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TherapistCreateOrConnectWithoutProcessedByAdminInputSchema),z.lazy(() => TherapistCreateOrConnectWithoutProcessedByAdminInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TherapistCreateManyProcessedByAdminInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TherapistWhereUniqueInputSchema),z.lazy(() => TherapistWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TherapistUncheckedCreateNestedManyWithoutProcessedByAdminInputSchema;
