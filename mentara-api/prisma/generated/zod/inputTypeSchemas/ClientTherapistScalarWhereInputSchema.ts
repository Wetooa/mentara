import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';

export const ClientTherapistScalarWhereInputSchema: z.ZodType<Prisma.ClientTherapistScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ClientTherapistScalarWhereInputSchema),z.lazy(() => ClientTherapistScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientTherapistScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientTherapistScalarWhereInputSchema),z.lazy(() => ClientTherapistScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  score: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
}).strict();

export default ClientTherapistScalarWhereInputSchema;
