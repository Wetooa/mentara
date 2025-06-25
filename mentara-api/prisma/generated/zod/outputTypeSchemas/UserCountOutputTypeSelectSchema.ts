import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  memberships: z.boolean().optional(),
  posts: z.boolean().optional(),
  comments: z.boolean().optional(),
  postHearts: z.boolean().optional(),
  commentHearts: z.boolean().optional(),
  replies: z.boolean().optional(),
  replyHearts: z.boolean().optional(),
}).strict();

export default UserCountOutputTypeSelectSchema;
