import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutClientPreferencesInputSchema } from './ClientUpdateWithoutClientPreferencesInputSchema';
import { ClientUncheckedUpdateWithoutClientPreferencesInputSchema } from './ClientUncheckedUpdateWithoutClientPreferencesInputSchema';

export const ClientUpdateToOneWithWhereWithoutClientPreferencesInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutClientPreferencesInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutClientPreferencesInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutClientPreferencesInputSchema;
