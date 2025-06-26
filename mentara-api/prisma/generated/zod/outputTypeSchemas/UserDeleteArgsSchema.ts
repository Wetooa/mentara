import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserIncludeSchema } from '../inputTypeSchemas/UserIncludeSchema'
import { UserWhereUniqueInputSchema } from '../inputTypeSchemas/UserWhereUniqueInputSchema'
import { MembershipFindManyArgsSchema } from "../outputTypeSchemas/MembershipFindManyArgsSchema"
import { PostFindManyArgsSchema } from "../outputTypeSchemas/PostFindManyArgsSchema"
import { CommentFindManyArgsSchema } from "../outputTypeSchemas/CommentFindManyArgsSchema"
import { PostHeartFindManyArgsSchema } from "../outputTypeSchemas/PostHeartFindManyArgsSchema"
import { CommentHeartFindManyArgsSchema } from "../outputTypeSchemas/CommentHeartFindManyArgsSchema"
import { ClientArgsSchema } from "../outputTypeSchemas/ClientArgsSchema"
import { TherapistArgsSchema } from "../outputTypeSchemas/TherapistArgsSchema"
import { ModeratorArgsSchema } from "../outputTypeSchemas/ModeratorArgsSchema"
import { AdminArgsSchema } from "../outputTypeSchemas/AdminArgsSchema"
import { ReplyFindManyArgsSchema } from "../outputTypeSchemas/ReplyFindManyArgsSchema"
import { ReplyHeartFindManyArgsSchema } from "../outputTypeSchemas/ReplyHeartFindManyArgsSchema"
import { ReviewHelpfulFindManyArgsSchema } from "../outputTypeSchemas/ReviewHelpfulFindManyArgsSchema"
import { ConversationParticipantFindManyArgsSchema } from "../outputTypeSchemas/ConversationParticipantFindManyArgsSchema"
import { MessageFindManyArgsSchema } from "../outputTypeSchemas/MessageFindManyArgsSchema"
import { MessageReadReceiptFindManyArgsSchema } from "../outputTypeSchemas/MessageReadReceiptFindManyArgsSchema"
import { MessageReactionFindManyArgsSchema } from "../outputTypeSchemas/MessageReactionFindManyArgsSchema"
import { UserBlockFindManyArgsSchema } from "../outputTypeSchemas/UserBlockFindManyArgsSchema"
import { UserCountOutputTypeArgsSchema } from "../outputTypeSchemas/UserCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  firstName: z.boolean().optional(),
  middleName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  birthDate: z.boolean().optional(),
  address: z.boolean().optional(),
  avatarUrl: z.boolean().optional(),
  role: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  bio: z.boolean().optional(),
  coverImageUrl: z.boolean().optional(),
  isActive: z.boolean().optional(),
  memberships: z.union([z.boolean(),z.lazy(() => MembershipFindManyArgsSchema)]).optional(),
  posts: z.union([z.boolean(),z.lazy(() => PostFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => CommentFindManyArgsSchema)]).optional(),
  postHearts: z.union([z.boolean(),z.lazy(() => PostHeartFindManyArgsSchema)]).optional(),
  commentHearts: z.union([z.boolean(),z.lazy(() => CommentHeartFindManyArgsSchema)]).optional(),
  client: z.union([z.boolean(),z.lazy(() => ClientArgsSchema)]).optional(),
  therapist: z.union([z.boolean(),z.lazy(() => TherapistArgsSchema)]).optional(),
  moderator: z.union([z.boolean(),z.lazy(() => ModeratorArgsSchema)]).optional(),
  admin: z.union([z.boolean(),z.lazy(() => AdminArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => ReplyFindManyArgsSchema)]).optional(),
  replyHearts: z.union([z.boolean(),z.lazy(() => ReplyHeartFindManyArgsSchema)]).optional(),
  reviewsHelpful: z.union([z.boolean(),z.lazy(() => ReviewHelpfulFindManyArgsSchema)]).optional(),
  conversations: z.union([z.boolean(),z.lazy(() => ConversationParticipantFindManyArgsSchema)]).optional(),
  sentMessages: z.union([z.boolean(),z.lazy(() => MessageFindManyArgsSchema)]).optional(),
  messageReadReceipts: z.union([z.boolean(),z.lazy(() => MessageReadReceiptFindManyArgsSchema)]).optional(),
  messageReactions: z.union([z.boolean(),z.lazy(() => MessageReactionFindManyArgsSchema)]).optional(),
  blocking: z.union([z.boolean(),z.lazy(() => UserBlockFindManyArgsSchema)]).optional(),
  blockedBy: z.union([z.boolean(),z.lazy(() => UserBlockFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export default UserDeleteArgsSchema;
