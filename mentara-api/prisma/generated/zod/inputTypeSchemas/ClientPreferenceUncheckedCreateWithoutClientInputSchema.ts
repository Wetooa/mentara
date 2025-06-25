import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientPreferenceUncheckedCreateWithoutClientInputSchema: z.ZodType<Prisma.ClientPreferenceUncheckedCreateWithoutClientInput> = z.object({
  id: z.string().uuid().optional(),
  key: z.string(),
  value: z.string()
}).strict();

export default ClientPreferenceUncheckedCreateWithoutClientInputSchema;
