import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceScalarWhereInputSchema } from './ClientPreferenceScalarWhereInputSchema';
import { ClientPreferenceUpdateManyMutationInputSchema } from './ClientPreferenceUpdateManyMutationInputSchema';
import { ClientPreferenceUncheckedUpdateManyWithoutClientInputSchema } from './ClientPreferenceUncheckedUpdateManyWithoutClientInputSchema';

export const ClientPreferenceUpdateManyWithWhereWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceUpdateManyWithWhereWithoutClientInput> = z.object({
  where: z.lazy(() => ClientPreferenceScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ClientPreferenceUpdateManyMutationInputSchema),z.lazy(() => ClientPreferenceUncheckedUpdateManyWithoutClientInputSchema) ]),
}).strict();

export default ClientPreferenceUpdateManyWithWhereWithoutClientInputSchema;
