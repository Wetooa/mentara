import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientNullableScalarRelationFilterSchema: z.ZodType<Prisma.ClientNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => ClientWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ClientWhereInputSchema).optional().nullable()
}).strict();

export default ClientNullableScalarRelationFilterSchema;
