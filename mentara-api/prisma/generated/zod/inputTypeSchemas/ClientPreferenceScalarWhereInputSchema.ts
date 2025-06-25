import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';

export const ClientPreferenceScalarWhereInputSchema: z.ZodType<Prisma.ClientPreferenceScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ClientPreferenceScalarWhereInputSchema),z.lazy(() => ClientPreferenceScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientPreferenceScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientPreferenceScalarWhereInputSchema),z.lazy(() => ClientPreferenceScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  key: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  value: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export default ClientPreferenceScalarWhereInputSchema;
