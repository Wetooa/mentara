import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ReplyUpdateOneRequiredWithoutHeartsNestedInputSchema } from './ReplyUpdateOneRequiredWithoutHeartsNestedInputSchema';
import { UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema } from './UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema';

export const ReplyHeartUpdateInputSchema: z.ZodType<Prisma.ReplyHeartUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reply: z.lazy(() => ReplyUpdateOneRequiredWithoutHeartsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReplyHeartsNestedInputSchema).optional()
}).strict();

export default ReplyHeartUpdateInputSchema;
