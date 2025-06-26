import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceWhereUniqueInputSchema } from './ClientPreferenceWhereUniqueInputSchema';
import { ClientPreferenceCreateWithoutClientInputSchema } from './ClientPreferenceCreateWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateWithoutClientInputSchema';

export const ClientPreferenceCreateOrConnectWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceCreateOrConnectWithoutClientInput> = z.object({
  where: z.lazy(() => ClientPreferenceWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientPreferenceCreateWithoutClientInputSchema),z.lazy(() => ClientPreferenceUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ClientPreferenceCreateOrConnectWithoutClientInputSchema;
