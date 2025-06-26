import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutClientPreferencesInputSchema } from './ClientCreateWithoutClientPreferencesInputSchema';
import { ClientUncheckedCreateWithoutClientPreferencesInputSchema } from './ClientUncheckedCreateWithoutClientPreferencesInputSchema';

export const ClientCreateOrConnectWithoutClientPreferencesInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutClientPreferencesInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientPreferencesInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutClientPreferencesInputSchema;
