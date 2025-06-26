import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceWhereUniqueInputSchema } from './ClientPreferenceWhereUniqueInputSchema';
import { ClientPreferenceUpdateWithoutClientInputSchema } from './ClientPreferenceUpdateWithoutClientInputSchema';
import { ClientPreferenceUncheckedUpdateWithoutClientInputSchema } from './ClientPreferenceUncheckedUpdateWithoutClientInputSchema';

export const ClientPreferenceUpdateWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceUpdateWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ClientPreferenceWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ClientPreferenceUpdateWithoutClientInputSchema),z.lazy(() => ClientPreferenceUncheckedUpdateWithoutClientInputSchema) ]),
}).strict();

export default ClientPreferenceUpdateWithWhereUniqueWithoutClientInputSchema;
