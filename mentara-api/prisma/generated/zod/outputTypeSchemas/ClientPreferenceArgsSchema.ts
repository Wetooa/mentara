import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientPreferenceSelectSchema } from '../inputTypeSchemas/ClientPreferenceSelectSchema';
import { ClientPreferenceIncludeSchema } from '../inputTypeSchemas/ClientPreferenceIncludeSchema';

export const ClientPreferenceArgsSchema: z.ZodType<Prisma.ClientPreferenceDefaultArgs> = z.object({
  select: z.lazy(() => ClientPreferenceSelectSchema).optional(),
  include: z.lazy(() => ClientPreferenceIncludeSchema).optional(),
}).strict();

export default ClientPreferenceArgsSchema;
