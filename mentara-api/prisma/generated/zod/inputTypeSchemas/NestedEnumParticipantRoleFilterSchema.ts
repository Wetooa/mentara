import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';

export const NestedEnumParticipantRoleFilterSchema: z.ZodType<Prisma.NestedEnumParticipantRoleFilter> = z.object({
  equals: z.lazy(() => ParticipantRoleSchema).optional(),
  in: z.lazy(() => ParticipantRoleSchema).array().optional(),
  notIn: z.lazy(() => ParticipantRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => ParticipantRoleSchema),z.lazy(() => NestedEnumParticipantRoleFilterSchema) ]).optional(),
}).strict();

export default NestedEnumParticipantRoleFilterSchema;
