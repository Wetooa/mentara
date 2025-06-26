import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutClientPreferencesInputSchema } from './ClientCreateWithoutClientPreferencesInputSchema';
import { ClientUncheckedCreateWithoutClientPreferencesInputSchema } from './ClientUncheckedCreateWithoutClientPreferencesInputSchema';
import { ClientCreateOrConnectWithoutClientPreferencesInputSchema } from './ClientCreateOrConnectWithoutClientPreferencesInputSchema';
import { ClientUpsertWithoutClientPreferencesInputSchema } from './ClientUpsertWithoutClientPreferencesInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutClientPreferencesInputSchema } from './ClientUpdateToOneWithWhereWithoutClientPreferencesInputSchema';
import { ClientUpdateWithoutClientPreferencesInputSchema } from './ClientUpdateWithoutClientPreferencesInputSchema';
import { ClientUncheckedUpdateWithoutClientPreferencesInputSchema } from './ClientUncheckedUpdateWithoutClientPreferencesInputSchema';

export const ClientUpdateOneRequiredWithoutClientPreferencesNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutClientPreferencesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedCreateWithoutClientPreferencesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutClientPreferencesInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutClientPreferencesInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutClientPreferencesInputSchema),z.lazy(() => ClientUpdateWithoutClientPreferencesInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutClientPreferencesInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutClientPreferencesNestedInputSchema;
