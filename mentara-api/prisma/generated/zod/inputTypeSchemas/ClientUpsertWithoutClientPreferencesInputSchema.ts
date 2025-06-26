import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutClientPreferencesInputSchema } from './ClientUpdateWithoutClientPreferencesInputSchema';
import { ClientUncheckedUpdateWithoutClientPreferencesInputSchema } from './ClientUncheckedUpdateWithoutClientPreferencesInputSchema';
import { ClientCreateWithoutClientPreferencesInputSchema } from './ClientCreateWithoutClientPreferencesInputSchema';
import { ClientUncheckedCreateWithoutClientPreferencesInputSchema } from './ClientUncheckedCreateWithoutClientPreferencesInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutClientPreferencesInputSchema: z.ZodType<Prisma.ClientUpsertWithoutClientPreferencesInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutClientPreferencesInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientPreferencesInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutClientPreferencesInputSchema;
