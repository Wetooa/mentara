import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { MembershipListRelationFilterSchema } from './MembershipListRelationFilterSchema';
import { PostListRelationFilterSchema } from './PostListRelationFilterSchema';
import { CommentListRelationFilterSchema } from './CommentListRelationFilterSchema';
import { PostHeartListRelationFilterSchema } from './PostHeartListRelationFilterSchema';
import { CommentHeartListRelationFilterSchema } from './CommentHeartListRelationFilterSchema';
import { ClientNullableScalarRelationFilterSchema } from './ClientNullableScalarRelationFilterSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { TherapistNullableScalarRelationFilterSchema } from './TherapistNullableScalarRelationFilterSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { ModeratorNullableScalarRelationFilterSchema } from './ModeratorNullableScalarRelationFilterSchema';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { AdminNullableScalarRelationFilterSchema } from './AdminNullableScalarRelationFilterSchema';
import { AdminWhereInputSchema } from './AdminWhereInputSchema';
import { ReplyListRelationFilterSchema } from './ReplyListRelationFilterSchema';
import { ReplyHeartListRelationFilterSchema } from './ReplyHeartListRelationFilterSchema';
import { ReviewHelpfulListRelationFilterSchema } from './ReviewHelpfulListRelationFilterSchema';
import { ConversationParticipantListRelationFilterSchema } from './ConversationParticipantListRelationFilterSchema';
import { MessageListRelationFilterSchema } from './MessageListRelationFilterSchema';
import { MessageReadReceiptListRelationFilterSchema } from './MessageReadReceiptListRelationFilterSchema';
import { MessageReactionListRelationFilterSchema } from './MessageReactionListRelationFilterSchema';
import { UserBlockListRelationFilterSchema } from './UserBlockListRelationFilterSchema';

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    email: z.string()
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  middleName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  birthDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  address: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  avatarUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  bio: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  coverImageUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  memberships: z.lazy(() => MembershipListRelationFilterSchema).optional(),
  posts: z.lazy(() => PostListRelationFilterSchema).optional(),
  comments: z.lazy(() => CommentListRelationFilterSchema).optional(),
  postHearts: z.lazy(() => PostHeartListRelationFilterSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartListRelationFilterSchema).optional(),
  client: z.union([ z.lazy(() => ClientNullableScalarRelationFilterSchema),z.lazy(() => ClientWhereInputSchema) ]).optional().nullable(),
  therapist: z.union([ z.lazy(() => TherapistNullableScalarRelationFilterSchema),z.lazy(() => TherapistWhereInputSchema) ]).optional().nullable(),
  moderator: z.union([ z.lazy(() => ModeratorNullableScalarRelationFilterSchema),z.lazy(() => ModeratorWhereInputSchema) ]).optional().nullable(),
  admin: z.union([ z.lazy(() => AdminNullableScalarRelationFilterSchema),z.lazy(() => AdminWhereInputSchema) ]).optional().nullable(),
  replies: z.lazy(() => ReplyListRelationFilterSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartListRelationFilterSchema).optional(),
  reviewsHelpful: z.lazy(() => ReviewHelpfulListRelationFilterSchema).optional(),
  conversations: z.lazy(() => ConversationParticipantListRelationFilterSchema).optional(),
  sentMessages: z.lazy(() => MessageListRelationFilterSchema).optional(),
  messageReadReceipts: z.lazy(() => MessageReadReceiptListRelationFilterSchema).optional(),
  messageReactions: z.lazy(() => MessageReactionListRelationFilterSchema).optional(),
  blocking: z.lazy(() => UserBlockListRelationFilterSchema).optional(),
  blockedBy: z.lazy(() => UserBlockListRelationFilterSchema).optional()
}).strict());

export default UserWhereUniqueInputSchema;
