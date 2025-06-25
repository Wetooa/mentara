import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutClientPreferencesInputSchema } from './ClientCreateWithoutClientPreferencesInputSchema';
import { ClientUncheckedCreateWithoutClientPreferencesInputSchema } from './ClientUncheckedCreateWithoutClientPreferencesInputSchema';
import { ClientCreateOrConnectWithoutClientPreferencesInputSchema } from './ClientCreateOrConnectWithoutClientPreferencesInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutClientPreferencesInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutClientPreferencesInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientPreferencesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutClientPreferencesInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutClientPreferencesInputSchema;
