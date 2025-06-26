import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientCountOutputTypeSelectSchema } from './ClientCountOutputTypeSelectSchema';

export const ClientCountOutputTypeArgsSchema: z.ZodType<Prisma.ClientCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ClientCountOutputTypeSelectSchema).nullish(),
}).strict();

export default ClientCountOutputTypeSelectSchema;
