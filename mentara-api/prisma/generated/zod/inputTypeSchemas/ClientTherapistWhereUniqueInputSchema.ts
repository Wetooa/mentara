import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema } from './ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema';
import { ClientTherapistWhereInputSchema } from './ClientTherapistWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { ClientScalarRelationFilterSchema } from './ClientScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { TherapistScalarRelationFilterSchema } from './TherapistScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const ClientTherapistWhereUniqueInputSchema: z.ZodType<Prisma.ClientTherapistWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    clientId_therapistId: z.lazy(() => ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    clientId_therapistId: z.lazy(() => ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  clientId_therapistId: z.lazy(() => ClientTherapistClientIdTherapistIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ClientTherapistWhereInputSchema),z.lazy(() => ClientTherapistWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ClientTherapistWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ClientTherapistWhereInputSchema),z.lazy(() => ClientTherapistWhereInputSchema).array() ]).optional(),
  clientId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  assignedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  score: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  client: z.union([ z.lazy(() => ClientScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
}).strict());

export default ClientTherapistWhereUniqueInputSchema;
