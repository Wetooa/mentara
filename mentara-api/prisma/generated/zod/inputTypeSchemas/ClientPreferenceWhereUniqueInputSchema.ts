import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientPreferenceWhereInputSchema } from './ClientPreferenceWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientPreferenceWhereUniqueInputSchema: z.ZodType<Prisma.ClientPreferenceWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => ClientPreferenceWhereInputSchema),z.lazy(() => ClientPreferenceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientPreferenceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientPreferenceWhereInputSchema),z.lazy(() => ClientPreferenceWhereInputSchema).array() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict());

export default ClientPreferenceWhereUniqueInputSchema;
