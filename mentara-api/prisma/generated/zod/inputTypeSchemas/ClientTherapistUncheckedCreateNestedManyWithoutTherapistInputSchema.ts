import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistCreateWithoutTherapistInputSchema } from './ClientTherapistCreateWithoutTherapistInputSchema';
import { ClientTherapistUncheckedCreateWithoutTherapistInputSchema } from './ClientTherapistUncheckedCreateWithoutTherapistInputSchema';
import { ClientTherapistCreateOrConnectWithoutTherapistInputSchema } from './ClientTherapistCreateOrConnectWithoutTherapistInputSchema';
import { ClientTherapistCreateManyTherapistInputEnvelopeSchema } from './ClientTherapistCreateManyTherapistInputEnvelopeSchema';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';

export const ClientTherapistUncheckedCreateNestedManyWithoutTherapistInputSchema: z.ZodType<Prisma.ClientTherapistUncheckedCreateNestedManyWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistCreateWithoutTherapistInputSchema).array(),z.lazy(() => ClientTherapistUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientTherapistCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => ClientTherapistCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientTherapistCreateManyTherapistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ClientTherapistUncheckedCreateNestedManyWithoutTherapistInputSchema;
