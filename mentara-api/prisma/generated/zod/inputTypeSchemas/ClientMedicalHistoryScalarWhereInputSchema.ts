import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const ClientMedicalHistoryScalarWhereInputSchema: z.ZodType<Prisma.ClientMedicalHistoryScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema),z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema),z.lazy(() => ClientMedicalHistoryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  condition: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default ClientMedicalHistoryScalarWhereInputSchema;
