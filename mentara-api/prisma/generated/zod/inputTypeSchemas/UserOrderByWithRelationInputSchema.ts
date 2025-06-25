import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { MembershipOrderByRelationAggregateInputSchema } from './MembershipOrderByRelationAggregateInputSchema';
import { PostOrderByRelationAggregateInputSchema } from './PostOrderByRelationAggregateInputSchema';
import { CommentOrderByRelationAggregateInputSchema } from './CommentOrderByRelationAggregateInputSchema';
import { PostHeartOrderByRelationAggregateInputSchema } from './PostHeartOrderByRelationAggregateInputSchema';
import { CommentHeartOrderByRelationAggregateInputSchema } from './CommentHeartOrderByRelationAggregateInputSchema';
import { ClientOrderByWithRelationInputSchema } from './ClientOrderByWithRelationInputSchema';
import { TherapistOrderByWithRelationInputSchema } from './TherapistOrderByWithRelationInputSchema';
import { ModeratorOrderByWithRelationInputSchema } from './ModeratorOrderByWithRelationInputSchema';
import { AdminOrderByWithRelationInputSchema } from './AdminOrderByWithRelationInputSchema';
import { ReplyOrderByRelationAggregateInputSchema } from './ReplyOrderByRelationAggregateInputSchema';
import { ReplyHeartOrderByRelationAggregateInputSchema } from './ReplyHeartOrderByRelationAggregateInputSchema';

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  middleName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  birthDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  address: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  avatarUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  memberships: z.lazy(() => MembershipOrderByRelationAggregateInputSchema).optional(),
  posts: z.lazy(() => PostOrderByRelationAggregateInputSchema).optional(),
  comments: z.lazy(() => CommentOrderByRelationAggregateInputSchema).optional(),
  postHearts: z.lazy(() => PostHeartOrderByRelationAggregateInputSchema).optional(),
  commentHearts: z.lazy(() => CommentHeartOrderByRelationAggregateInputSchema).optional(),
  client: z.lazy(() => ClientOrderByWithRelationInputSchema).optional(),
  therapist: z.lazy(() => TherapistOrderByWithRelationInputSchema).optional(),
  moderator: z.lazy(() => ModeratorOrderByWithRelationInputSchema).optional(),
  admin: z.lazy(() => AdminOrderByWithRelationInputSchema).optional(),
  replies: z.lazy(() => ReplyOrderByRelationAggregateInputSchema).optional(),
  replyHearts: z.lazy(() => ReplyHeartOrderByRelationAggregateInputSchema).optional()
}).strict();

export default UserOrderByWithRelationInputSchema;
