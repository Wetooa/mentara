import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ClientTherapistSelectSchema } from '../inputTypeSchemas/ClientTherapistSelectSchema';
import { ClientTherapistIncludeSchema } from '../inputTypeSchemas/ClientTherapistIncludeSchema';

export const ClientTherapistArgsSchema: z.ZodType<Prisma.ClientTherapistDefaultArgs> = z.object({
  select: z.lazy(() => ClientTherapistSelectSchema).optional(),
  include: z.lazy(() => ClientTherapistIncludeSchema).optional(),
}).strict();

export default ClientTherapistArgsSchema;
