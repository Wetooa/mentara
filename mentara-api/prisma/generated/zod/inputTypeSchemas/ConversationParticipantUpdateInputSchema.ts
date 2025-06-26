import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { ParticipantRoleSchema } from './ParticipantRoleSchema';
import { EnumParticipantRoleFieldUpdateOperationsInputSchema } from './EnumParticipantRoleFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { ConversationUpdateOneRequiredWithoutParticipantsNestedInputSchema } from './ConversationUpdateOneRequiredWithoutParticipantsNestedInputSchema';
import { UserUpdateOneRequiredWithoutConversationsNestedInputSchema } from './UserUpdateOneRequiredWithoutConversationsNestedInputSchema';

export const ConversationParticipantUpdateInputSchema: z.ZodType<Prisma.ConversationParticipantUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  lastReadAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => ParticipantRoleSchema),z.lazy(() => EnumParticipantRoleFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  isMuted: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  conversation: z.lazy(() => ConversationUpdateOneRequiredWithoutParticipantsNestedInputSchema).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutConversationsNestedInputSchema).optional()
}).strict();

export default ConversationParticipantUpdateInputSchema;
