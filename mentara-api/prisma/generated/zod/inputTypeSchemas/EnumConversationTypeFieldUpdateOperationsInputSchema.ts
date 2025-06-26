import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationTypeSchema } from './ConversationTypeSchema';

export const EnumConversationTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumConversationTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ConversationTypeSchema).optional()
}).strict();

export default EnumConversationTypeFieldUpdateOperationsInputSchema;
