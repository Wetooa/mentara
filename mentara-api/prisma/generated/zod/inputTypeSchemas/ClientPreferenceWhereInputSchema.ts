import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientPreferenceWhereInputSchema: z.ZodType<Prisma.ClientPreferenceWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ClientPreferenceWhereInputSchema),z.lazy(() => ClientPreferenceWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientPreferenceWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientPreferenceWhereInputSchema),z.lazy(() => ClientPreferenceWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict();

export default ClientPreferenceWhereInputSchema;
