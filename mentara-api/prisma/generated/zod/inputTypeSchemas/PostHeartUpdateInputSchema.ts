import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { PostUpdateOneRequiredWithoutHeartsNestedInputSchema } from './PostUpdateOneRequiredWithoutHeartsNestedInputSchema';
import { UserUpdateOneWithoutPostHeartsNestedInputSchema } from './UserUpdateOneWithoutPostHeartsNestedInputSchema';

export const PostHeartUpdateInputSchema: z.ZodType<Prisma.PostHeartUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  post: z.lazy(() => PostUpdateOneRequiredWithoutHeartsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneWithoutPostHeartsNestedInputSchema).optional()
}).strict();

export default PostHeartUpdateInputSchema;
