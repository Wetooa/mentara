import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientSelectSchema } from '../inputTypeSchemas/ClientSelectSchema';
import { ClientIncludeSchema } from '../inputTypeSchemas/ClientIncludeSchema';

export const ClientArgsSchema: z.ZodType<Prisma.ClientDefaultArgs> = z.object({
  select: z.lazy(() => ClientSelectSchema).optional(),
  include: z.lazy(() => ClientIncludeSchema).optional(),
}).strict();

export default ClientArgsSchema;
