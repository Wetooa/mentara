import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceWhereUniqueInputSchema } from './ClientPreferenceWhereUniqueInputSchema';
import { ClientPreferenceUpdateWithoutClientInputSchema } from './ClientPreferenceUpdateWithoutClientInputSchema';
import { ClientPreferenceUncheckedUpdateWithoutClientInputSchema } from './ClientPreferenceUncheckedUpdateWithoutClientInputSchema';
import { ClientPreferenceCreateWithoutClientInputSchema } from './ClientPreferenceCreateWithoutClientInputSchema';
import { ClientPreferenceUncheckedCreateWithoutClientInputSchema } from './ClientPreferenceUncheckedCreateWithoutClientInputSchema';

export const ClientPreferenceUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ClientPreferenceWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ClientPreferenceUpdateWithoutClientInputSchema),z.lazy(() => ClientPreferenceUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => ClientPreferenceCreateWithoutClientInputSchema),z.lazy(() => ClientPreferenceUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ClientPreferenceUpsertWithWhereUniqueWithoutClientInputSchema;
