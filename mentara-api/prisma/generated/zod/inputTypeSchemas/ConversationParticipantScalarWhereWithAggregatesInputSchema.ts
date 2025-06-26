import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { EnumParticipantRoleWithAggregatesFilterSchema } from './EnumParticipantRoleWithAggregatesFilterSchema';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';

export const ConversationParticipantScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ConversationParticipantScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ConversationParticipantScalarWhereWithAggregatesInputSchema),z.lazy(() => ConversationParticipantScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ConversationParticipantScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ConversationParticipantScalarWhereWithAggregatesInputSchema),z.lazy(() => ConversationParticipantScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  conversationId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  joinedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  lastReadAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema),z.coerce.date() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumParticipantRoleWithAggregatesFilterSchema),z.lazy(() => ParticipantRoleSchema) ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  isMuted: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
}).strict();

export default ConversationParticipantScalarWhereWithAggregatesInputSchema;
