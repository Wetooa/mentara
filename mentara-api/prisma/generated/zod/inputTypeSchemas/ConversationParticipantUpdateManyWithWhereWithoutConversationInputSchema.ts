import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantScalarWhereInputSchema } from './ConversationParticipantScalarWhereInputSchema';
import { ConversationParticipantUpdateManyMutationInputSchema } from './ConversationParticipantUpdateManyMutationInputSchema';
import { ConversationParticipantUncheckedUpdateManyWithoutConversationInputSchema } from './ConversationParticipantUncheckedUpdateManyWithoutConversationInputSchema';

export const ConversationParticipantUpdateManyWithWhereWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantUpdateManyWithWhereWithoutConversationInput> = z.object({
  where: z.lazy(() => ConversationParticipantScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ConversationParticipantUpdateManyMutationInputSchema),z.lazy(() => ConversationParticipantUncheckedUpdateManyWithoutConversationInputSchema) ]),
}).strict();

export default ConversationParticipantUpdateManyWithWhereWithoutConversationInputSchema;
