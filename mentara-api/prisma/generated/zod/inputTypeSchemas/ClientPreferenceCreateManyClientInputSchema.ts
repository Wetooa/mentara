import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientPreferenceCreateManyClientInputSchema: z.ZodType<Prisma.ClientPreferenceCreateManyClientInput> = z.object({
  id: z.string().uuid().optional(),
  key: z.string(),
  value: z.string()
}).strict();

export default ClientPreferenceCreateManyClientInputSchema;
