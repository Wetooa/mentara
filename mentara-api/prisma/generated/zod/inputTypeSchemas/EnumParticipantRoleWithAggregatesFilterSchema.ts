import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';
import { NestedEnumParticipantRoleWithAggregatesFilterSchema } from './NestedEnumParticipantRoleWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumParticipantRoleFilterSchema } from './NestedEnumParticipantRoleFilterSchema';

export const EnumParticipantRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumParticipantRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ParticipantRoleSchema).optional(),
  in: z.lazy(() => ParticipantRoleSchema).array().optional(),
  notIn: z.lazy(() => ParticipantRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => ParticipantRoleSchema),z.lazy(() => NestedEnumParticipantRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumParticipantRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumParticipantRoleFilterSchema).optional()
}).strict();

export default EnumParticipantRoleWithAggregatesFilterSchema;
