import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientScalarRelationFilterSchema: z.ZodType<Prisma.ClientScalarRelationFilter> = z.object({
  is: z.lazy(() => ClientWhereInputSchema).optional(),
  isNot: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientScalarRelationFilterSchema;
