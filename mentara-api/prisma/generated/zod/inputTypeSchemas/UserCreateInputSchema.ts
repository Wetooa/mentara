import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MembershipCreateNestedManyWithoutUserInputSchema } from './MembershipCreateNestedManyWithoutUserInputSchema';
import { PostCreateNestedManyWithoutUserInputSchema } from './PostCreateNestedManyWithoutUserInputSchema';
import { CommentCreateNestedManyWithoutUserInputSchema } from './CommentCreateNestedManyWithoutUserInputSchema';
import { PostHeartCreateNestedManyWithoutUserInputSchema } from './PostHeartCreateNestedManyWithoutUserInputSchema';
import { CommentHeartCreateNestedManyWithoutUserInputSchema } from './CommentHeartCreateNestedManyWithoutUserInputSchema';
import { ClientCreateNestedOneWithoutUserInputSchema } from './ClientCreateNestedOneWithoutUserInputSchema';
import { TherapistCreateNestedOneWithoutUserInputSchema } from './TherapistCreateNestedOneWithoutUserInputSchema';
import { ModeratorCreateNestedOneWithoutUserInputSchema } from './ModeratorCreateNestedOneWithoutUserInputSchema';
import { AdminCreateNestedOneWithoutUserInputSchema } from './AdminCreateNestedOneWithoutUserInputSchema';
import { ReplyCreateNestedManyWithoutUserInputSchema } from './ReplyCreateNestedManyWithoutUserInputSchema';
import { ReplyHeartCreateNestedManyWithoutUserInputSchema } from './ReplyHeartCreateNestedManyWithoutUserInputSchema';
import { ReviewHelpfulCreateNestedManyWithoutUserInputSchema } from './ReviewHelpfulCreateNestedManyWithoutUserInputSchema';

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
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
  memberships: z.lazy(() => MembershipCreateNestedManyWithoutUserInputSchema).optional(),
  posts: z.lazy(() => PostCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => CommentCreateNestedManyWithoutUserInputSchema).optional(),
  postHearts: z.lazy(() => PostHeartCreateNestedManyWithoutUserInputSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartCreateNestedManyWithoutUserInputSchema).optional(),
  client: z.lazy(() => ClientCreateNestedOneWithoutUserInputSchema).optional(),
  therapist: z.lazy(() => TherapistCreateNestedOneWithoutUserInputSchema).optional(),
  moderator: z.lazy(() => ModeratorCreateNestedOneWithoutUserInputSchema).optional(),
  admin: z.lazy(() => AdminCreateNestedOneWithoutUserInputSchema).optional(),
  replies: z.lazy(() => ReplyCreateNestedManyWithoutUserInputSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartCreateNestedManyWithoutUserInputSchema).optional(),
  reviewsHelpful: z.lazy(() => ReviewHelpfulCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export default UserCreateInputSchema;
