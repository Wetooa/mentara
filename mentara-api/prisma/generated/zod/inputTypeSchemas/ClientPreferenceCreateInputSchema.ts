import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateNestedOneWithoutClientPreferencesInputSchema } from './ClientCreateNestedOneWithoutClientPreferencesInputSchema';

export const ClientPreferenceCreateInputSchema: z.ZodType<Prisma.ClientPreferenceCreateInput> = z.object({
  id: z.string().uuid().optional(),
  key: z.string(),
  value: z.string(),
  client: z.lazy(() => ClientCreateNestedOneWithoutClientPreferencesInputSchema)
}).strict();

export default ClientPreferenceCreateInputSchema;
