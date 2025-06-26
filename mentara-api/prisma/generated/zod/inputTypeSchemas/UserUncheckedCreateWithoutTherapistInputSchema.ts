import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipUncheckedCreateNestedManyWithoutUserInputSchema } from './MembershipUncheckedCreateNestedManyWithoutUserInputSchema';
import { PostUncheckedCreateNestedManyWithoutUserInputSchema } from './PostUncheckedCreateNestedManyWithoutUserInputSchema';
import { CommentUncheckedCreateNestedManyWithoutUserInputSchema } from './CommentUncheckedCreateNestedManyWithoutUserInputSchema';
import { PostHeartUncheckedCreateNestedManyWithoutUserInputSchema } from './PostHeartUncheckedCreateNestedManyWithoutUserInputSchema';
import { CommentHeartUncheckedCreateNestedManyWithoutUserInputSchema } from './CommentHeartUncheckedCreateNestedManyWithoutUserInputSchema';
import { ClientUncheckedCreateNestedOneWithoutUserInputSchema } from './ClientUncheckedCreateNestedOneWithoutUserInputSchema';
import { ModeratorUncheckedCreateNestedOneWithoutUserInputSchema } from './ModeratorUncheckedCreateNestedOneWithoutUserInputSchema';
import { AdminUncheckedCreateNestedOneWithoutUserInputSchema } from './AdminUncheckedCreateNestedOneWithoutUserInputSchema';
import { ReplyUncheckedCreateNestedManyWithoutUserInputSchema } from './ReplyUncheckedCreateNestedManyWithoutUserInputSchema';
import { ReplyHeartUncheckedCreateNestedManyWithoutUserInputSchema } from './ReplyHeartUncheckedCreateNestedManyWithoutUserInputSchema';
import { ReviewHelpfulUncheckedCreateNestedManyWithoutUserInputSchema } from './ReviewHelpfulUncheckedCreateNestedManyWithoutUserInputSchema';
import { ConversationParticipantUncheckedCreateNestedManyWithoutUserInputSchema } from './ConversationParticipantUncheckedCreateNestedManyWithoutUserInputSchema';
import { MessageUncheckedCreateNestedManyWithoutSenderInputSchema } from './MessageUncheckedCreateNestedManyWithoutSenderInputSchema';
import { MessageReadReceiptUncheckedCreateNestedManyWithoutUserInputSchema } from './MessageReadReceiptUncheckedCreateNestedManyWithoutUserInputSchema';
import { MessageReactionUncheckedCreateNestedManyWithoutUserInputSchema } from './MessageReactionUncheckedCreateNestedManyWithoutUserInputSchema';
import { UserBlockUncheckedCreateNestedManyWithoutBlockerInputSchema } from './UserBlockUncheckedCreateNestedManyWithoutBlockerInputSchema';
import { UserBlockUncheckedCreateNestedManyWithoutBlockedInputSchema } from './UserBlockUncheckedCreateNestedManyWithoutBlockedInputSchema';

export const UserUncheckedCreateWithoutTherapistInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutTherapistInput> = z.object({
  id: z.string().uuid().optional(),
  email: z.string(),
  firstName: z.string(),
  middleName: z.string().optional().nullable(),
  lastName: z.string(),
  birthDate: z.coerce.date().optional().nullable(),
  address: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  role: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  bio: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  memberships: z.lazy(() => MembershipUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  posts: z.lazy(() => PostUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  postHearts: z.lazy(() => PostHeartUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  client: z.lazy(() => ClientUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  moderator: z.lazy(() => ModeratorUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  admin: z.lazy(() => AdminUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviewsHelpful: z.lazy(() => ReviewHelpfulUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  conversations: z.lazy(() => ConversationParticipantUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  sentMessages: z.lazy(() => MessageUncheckedCreateNestedManyWithoutSenderInputSchema).optional(),
  messageReadReceipts: z.lazy(() => MessageReadReceiptUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  messageReactions: z.lazy(() => MessageReactionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  blocking: z.lazy(() => UserBlockUncheckedCreateNestedManyWithoutBlockerInputSchema).optional(),
  blockedBy: z.lazy(() => UserBlockUncheckedCreateNestedManyWithoutBlockedInputSchema).optional()
}).strict();

export default UserUncheckedCreateWithoutTherapistInputSchema;
