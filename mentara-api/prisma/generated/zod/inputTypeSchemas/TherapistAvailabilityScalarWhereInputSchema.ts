import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const TherapistAvailabilityScalarWhereInputSchema: z.ZodType<Prisma.TherapistAvailabilityScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TherapistAvailabilityScalarWhereInputSchema),z.lazy(() => TherapistAvailabilityScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistAvailabilityScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistAvailabilityScalarWhereInputSchema),z.lazy(() => TherapistAvailabilityScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayOfWeek: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  startTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  endTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isAvailable: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TherapistAvailabilityScalarWhereInputSchema;
