import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneWithoutPostHeartsNestedInputSchema } from './UserUpdateOneWithoutPostHeartsNestedInputSchema';

export const PostHeartUpdateWithoutPostInputSchema: z.ZodType<Prisma.PostHeartUpdateWithoutPostInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutPostHeartsNestedInputSchema).optional()
}).strict();

export default PostHeartUpdateWithoutPostInputSchema;
