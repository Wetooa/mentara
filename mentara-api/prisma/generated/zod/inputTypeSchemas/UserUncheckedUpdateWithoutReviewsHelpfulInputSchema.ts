import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { MembershipUncheckedUpdateManyWithoutUserNestedInputSchema } from './MembershipUncheckedUpdateManyWithoutUserNestedInputSchema';
import { PostUncheckedUpdateManyWithoutUserNestedInputSchema } from './PostUncheckedUpdateManyWithoutUserNestedInputSchema';
import { CommentUncheckedUpdateManyWithoutUserNestedInputSchema } from './CommentUncheckedUpdateManyWithoutUserNestedInputSchema';
import { PostHeartUncheckedUpdateManyWithoutUserNestedInputSchema } from './PostHeartUncheckedUpdateManyWithoutUserNestedInputSchema';
import { CommentHeartUncheckedUpdateManyWithoutUserNestedInputSchema } from './CommentHeartUncheckedUpdateManyWithoutUserNestedInputSchema';
import { ClientUncheckedUpdateOneWithoutUserNestedInputSchema } from './ClientUncheckedUpdateOneWithoutUserNestedInputSchema';
import { TherapistUncheckedUpdateOneWithoutUserNestedInputSchema } from './TherapistUncheckedUpdateOneWithoutUserNestedInputSchema';
import { ModeratorUncheckedUpdateOneWithoutUserNestedInputSchema } from './ModeratorUncheckedUpdateOneWithoutUserNestedInputSchema';
import { AdminUncheckedUpdateOneWithoutUserNestedInputSchema } from './AdminUncheckedUpdateOneWithoutUserNestedInputSchema';
import { ReplyUncheckedUpdateManyWithoutUserNestedInputSchema } from './ReplyUncheckedUpdateManyWithoutUserNestedInputSchema';
import { ReplyHeartUncheckedUpdateManyWithoutUserNestedInputSchema } from './ReplyHeartUncheckedUpdateManyWithoutUserNestedInputSchema';

export const UserUncheckedUpdateWithoutReviewsHelpfulInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutReviewsHelpfulInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  middleName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  memberships: z.lazy(() => MembershipUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  posts: z.lazy(() => PostUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  postHearts: z.lazy(() => PostHeartUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  client: z.lazy(() => ClientUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  therapist: z.lazy(() => TherapistUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  moderator: z.lazy(() => ModeratorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  admin: z.lazy(() => AdminUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export default UserUncheckedUpdateWithoutReviewsHelpfulInputSchema;
