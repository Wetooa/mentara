import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistCreateWithoutClientInputSchema } from './ClientTherapistCreateWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateWithoutClientInputSchema } from './ClientTherapistUncheckedCreateWithoutClientInputSchema';
import { ClientTherapistCreateOrConnectWithoutClientInputSchema } from './ClientTherapistCreateOrConnectWithoutClientInputSchema';
import { ClientTherapistCreateManyClientInputEnvelopeSchema } from './ClientTherapistCreateManyClientInputEnvelopeSchema';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';

export const ClientTherapistCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutClientInputSchema),z.lazy(() => ClientTherapistCreateWithoutClientInputSchema).array(),z.lazy(() => ClientTherapistUncheckedCreateWithoutClientInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientTherapistCreateOrConnectWithoutClientInputSchema),z.lazy(() => ClientTherapistCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientTherapistCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ClientTherapistWhereUniqueInputSchema),z.lazy(() => ClientTherapistWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ClientTherapistCreateNestedManyWithoutClientInputSchema;
