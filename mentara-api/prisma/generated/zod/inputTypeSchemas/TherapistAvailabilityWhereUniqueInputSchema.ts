import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema } from './TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema';
import { TherapistAvailabilityWhereInputSchema } from './TherapistAvailabilityWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { TherapistScalarRelationFilterSchema } from './TherapistScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';

export const TherapistAvailabilityWhereUniqueInputSchema: z.ZodType<Prisma.TherapistAvailabilityWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    therapistId_dayOfWeek_startTime_endTime: z.lazy(() => TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    therapistId_dayOfWeek_startTime_endTime: z.lazy(() => TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  therapistId_dayOfWeek_startTime_endTime: z.lazy(() => TherapistAvailabilityTherapistIdDayOfWeekStartTimeEndTimeCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => TherapistAvailabilityWhereInputSchema),z.lazy(() => TherapistAvailabilityWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TherapistAvailabilityWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TherapistAvailabilityWhereInputSchema),z.lazy(() => TherapistAvailabilityWhereInputSchema).array() ]).optional(),
  therapistId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  dayOfWeek: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  startTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  endTime: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isAvailable: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  therapist: z.union([ z.lazy(() => TherapistScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
}).strict());

export default TherapistAvailabilityWhereUniqueInputSchema;
