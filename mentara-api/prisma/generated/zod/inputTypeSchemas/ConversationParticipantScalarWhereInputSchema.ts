import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { EnumParticipantRoleFilterSchema } from './EnumParticipantRoleFilterSchema';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';
import { BoolFilterSchema } from './BoolFilterSchema';

export const ConversationParticipantScalarWhereInputSchema: z.ZodType<Prisma.ConversationParticipantScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ConversationParticipantScalarWhereInputSchema),z.lazy(() => ConversationParticipantScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ConversationParticipantScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ConversationParticipantScalarWhereInputSchema),z.lazy(() => ConversationParticipantScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  conversationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  joinedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  lastReadAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumParticipantRoleFilterSchema),z.lazy(() => ParticipantRoleSchema) ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  isMuted: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
}).strict();

export default ConversationParticipantScalarWhereInputSchema;
