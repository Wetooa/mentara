import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceCreateWithoutClientInputSchema } from './ClientPreferenceCreateWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateWithoutClientInputSchema';
import { ClientPreferenceCreateOrConnectWithoutClientInputSchema } from './ClientPreferenceCreateOrConnectWithoutClientInputSchema';
import { ClientPreferenceCreateManyClientInputEnvelopeSchema } from './ClientPreferenceCreateManyClientInputEnvelopeSchema';
import { ClientPreferenceWhereUniqueInputSchema } from './ClientPreferenceWhereUniqueInputSchema';

export const ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceUncheckedCreateNestedManyWithoutClientInput> = z.object({
  create: z.union([ z.lazy(() => ClientPreferenceCreateWithoutClientInputSchema),z.lazy(() => ClientPreferenceCreateWithoutClientInputSchema).array(),z.lazy(() => ClientPreferenceUncheckedCreateWithoutClientInputSchema),z.lazy(() => ClientPreferenceUncheckedCreateWithoutClientInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ClientPreferenceCreateOrConnectWithoutClientInputSchema),z.lazy(() => ClientPreferenceCreateOrConnectWithoutClientInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ClientPreferenceCreateManyClientInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ClientPreferenceWhereUniqueInputSchema),z.lazy(() => ClientPreferenceWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ClientPreferenceUncheckedCreateNestedManyWithoutClientInputSchema;
