import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { MembershipUpdateManyWithoutUserNestedInputSchema } from './MembershipUpdateManyWithoutUserNestedInputSchema';
import { PostUpdateManyWithoutUserNestedInputSchema } from './PostUpdateManyWithoutUserNestedInputSchema';
import { CommentUpdateManyWithoutUserNestedInputSchema } from './CommentUpdateManyWithoutUserNestedInputSchema';
import { PostHeartUpdateManyWithoutUserNestedInputSchema } from './PostHeartUpdateManyWithoutUserNestedInputSchema';
import { CommentHeartUpdateManyWithoutUserNestedInputSchema } from './CommentHeartUpdateManyWithoutUserNestedInputSchema';
import { ClientUpdateOneWithoutUserNestedInputSchema } from './ClientUpdateOneWithoutUserNestedInputSchema';
import { ModeratorUpdateOneWithoutUserNestedInputSchema } from './ModeratorUpdateOneWithoutUserNestedInputSchema';
import { AdminUpdateOneWithoutUserNestedInputSchema } from './AdminUpdateOneWithoutUserNestedInputSchema';
import { ReplyUpdateManyWithoutUserNestedInputSchema } from './ReplyUpdateManyWithoutUserNestedInputSchema';
import { ReplyHeartUpdateManyWithoutUserNestedInputSchema } from './ReplyHeartUpdateManyWithoutUserNestedInputSchema';

export const UserUpdateWithoutTherapistInputSchema: z.ZodType<Prisma.UserUpdateWithoutTherapistInput> = z.object({
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
  memberships: z.lazy(() => MembershipUpdateManyWithoutUserNestedInputSchema).optional(),
  posts: z.lazy(() => PostUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => CommentUpdateManyWithoutUserNestedInputSchema).optional(),
  postHearts: z.lazy(() => PostHeartUpdateManyWithoutUserNestedInputSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartUpdateManyWithoutUserNestedInputSchema).optional(),
  client: z.lazy(() => ClientUpdateOneWithoutUserNestedInputSchema).optional(),
  moderator: z.lazy(() => ModeratorUpdateOneWithoutUserNestedInputSchema).optional(),
  admin: z.lazy(() => AdminUpdateOneWithoutUserNestedInputSchema).optional(),
  replies: z.lazy(() => ReplyUpdateManyWithoutUserNestedInputSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export default UserUpdateWithoutTherapistInputSchema;
