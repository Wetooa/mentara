import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientPreferenceCreateWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  key: z.string(),
  value: z.string()
}).strict();

export default ClientPreferenceCreateWithoutClientInputSchema;
