import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ClientPreferenceCreateManyInputSchema: z.ZodType<Prisma.ClientPreferenceCreateManyInput> = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string(),
  key: z.string(),
  value: z.string()
}).strict();

export default ClientPreferenceCreateManyInputSchema;
