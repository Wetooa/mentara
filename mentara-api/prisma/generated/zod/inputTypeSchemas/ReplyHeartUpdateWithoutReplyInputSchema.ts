import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema } from './UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema';

export const ReplyHeartUpdateWithoutReplyInputSchema: z.ZodType<Prisma.ReplyHeartUpdateWithoutReplyInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema).optional()
}).strict();

export default ReplyHeartUpdateWithoutReplyInputSchema;
