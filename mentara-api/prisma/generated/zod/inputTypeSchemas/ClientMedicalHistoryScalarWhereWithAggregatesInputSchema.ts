import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const ClientMedicalHistoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ClientMedicalHistoryScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ClientMedicalHistoryScalarWhereWithAggregatesInputSchema),z.lazy(() => ClientMedicalHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientMedicalHistoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientMedicalHistoryScalarWhereWithAggregatesInputSchema),z.lazy(() => ClientMedicalHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  condition: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default ClientMedicalHistoryScalarWhereWithAggregatesInputSchema;
