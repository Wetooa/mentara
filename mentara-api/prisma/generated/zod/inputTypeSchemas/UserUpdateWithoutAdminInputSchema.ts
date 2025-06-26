import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { MembershipUpdateManyWithoutUserNestedInputSchema } from './MembershipUpdateManyWithoutUserNestedInputSchema';
import { PostUpdateManyWithoutUserNestedInputSchema } from './PostUpdateManyWithoutUserNestedInputSchema';
import { CommentUpdateManyWithoutUserNestedInputSchema } from './CommentUpdateManyWithoutUserNestedInputSchema';
import { PostHeartUpdateManyWithoutUserNestedInputSchema } from './PostHeartUpdateManyWithoutUserNestedInputSchema';
import { CommentHeartUpdateManyWithoutUserNestedInputSchema } from './CommentHeartUpdateManyWithoutUserNestedInputSchema';
import { ClientUpdateOneWithoutUserNestedInputSchema } from './ClientUpdateOneWithoutUserNestedInputSchema';
import { TherapistUpdateOneWithoutUserNestedInputSchema } from './TherapistUpdateOneWithoutUserNestedInputSchema';
import { ModeratorUpdateOneWithoutUserNestedInputSchema } from './ModeratorUpdateOneWithoutUserNestedInputSchema';
import { ReplyUpdateManyWithoutUserNestedInputSchema } from './ReplyUpdateManyWithoutUserNestedInputSchema';
import { ReplyHeartUpdateManyWithoutUserNestedInputSchema } from './ReplyHeartUpdateManyWithoutUserNestedInputSchema';
import { ReviewHelpfulUpdateManyWithoutUserNestedInputSchema } from './ReviewHelpfulUpdateManyWithoutUserNestedInputSchema';
import { ConversationParticipantUpdateManyWithoutUserNestedInputSchema } from './ConversationParticipantUpdateManyWithoutUserNestedInputSchema';
import { MessageUpdateManyWithoutSenderNestedInputSchema } from './MessageUpdateManyWithoutSenderNestedInputSchema';
import { MessageReadReceiptUpdateManyWithoutUserNestedInputSchema } from './MessageReadReceiptUpdateManyWithoutUserNestedInputSchema';
import { MessageReactionUpdateManyWithoutUserNestedInputSchema } from './MessageReactionUpdateManyWithoutUserNestedInputSchema';
import { UserBlockUpdateManyWithoutBlockerNestedInputSchema } from './UserBlockUpdateManyWithoutBlockerNestedInputSchema';
import { UserBlockUpdateManyWithoutBlockedNestedInputSchema } from './UserBlockUpdateManyWithoutBlockedNestedInputSchema';

export const UserUpdateWithoutAdminInputSchema: z.ZodType<Prisma.UserUpdateWithoutAdminInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  middleName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  bio: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  coverImageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  memberships: z.lazy(() => MembershipUpdateManyWithoutUserNestedInputSchema).optional(),
  posts: z.lazy(() => PostUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  postHearts: z.lazy(() => PostHeartUpdateManyWithoutUserNestedInputSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartUpdateManyWithoutUserNestedInputSchema).optional(),
  client: z.lazy(() => ClientUpdateOneWithoutUserNestedInputSchema).optional(),
  therapist: z.lazy(() => TherapistUpdateOneWithoutUserNestedInputSchema).optional(),
  moderator: z.lazy(() => ModeratorUpdateOneWithoutUserNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUpdateManyWithoutUserNestedInputSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartUpdateManyWithoutUserNestedInputSchema).optional(),
  reviewsHelpful: z.lazy(() => ReviewHelpfulUpdateManyWithoutUserNestedInputSchema).optional(),
  conversations: z.lazy(() => ConversationParticipantUpdateManyWithoutUserNestedInputSchema).optional(),
  sentMessages: z.lazy(() => MessageUpdateManyWithoutSenderNestedInputSchema).optional(),
  messageReadReceipts: z.lazy(() => MessageReadReceiptUpdateManyWithoutUserNestedInputSchema).optional(),
  messageReactions: z.lazy(() => MessageReactionUpdateManyWithoutUserNestedInputSchema).optional(),
  blocking: z.lazy(() => UserBlockUpdateManyWithoutBlockerNestedInputSchema).optional(),
  blockedBy: z.lazy(() => UserBlockUpdateManyWithoutBlockedNestedInputSchema).optional()
}).strict();

export default UserUpdateWithoutAdminInputSchema;
