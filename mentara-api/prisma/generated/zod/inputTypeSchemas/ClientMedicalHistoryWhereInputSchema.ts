import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientMedicalHistoryWhereInputSchema: z.ZodType<Prisma.ClientMedicalHistoryWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ClientMedicalHistoryWhereInputSchema),z.lazy(() => ClientMedicalHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientMedicalHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientMedicalHistoryWhereInputSchema),z.lazy(() => ClientMedicalHistoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  condition: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
}).strict();

export default ClientMedicalHistoryWhereInputSchema;
