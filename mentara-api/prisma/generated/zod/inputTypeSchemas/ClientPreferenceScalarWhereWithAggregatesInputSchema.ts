import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';

export const ClientPreferenceScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ClientPreferenceScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ClientPreferenceScalarWhereWithAggregatesInputSchema),z.lazy(() => ClientPreferenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientPreferenceScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientPreferenceScalarWhereWithAggregatesInputSchema),z.lazy(() => ClientPreferenceScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export default ClientPreferenceScalarWhereWithAggregatesInputSchema;
