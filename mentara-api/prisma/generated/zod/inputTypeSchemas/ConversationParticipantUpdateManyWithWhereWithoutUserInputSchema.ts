import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantScalarWhereInputSchema } from './ConversationParticipantScalarWhereInputSchema';
import { ConversationParticipantUpdateManyMutationInputSchema } from './ConversationParticipantUpdateManyMutationInputSchema';
import { ConversationParticipantUncheckedUpdateManyWithoutUserInputSchema } from './ConversationParticipantUncheckedUpdateManyWithoutUserInputSchema';

export const ConversationParticipantUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ConversationParticipantUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ConversationParticipantScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ConversationParticipantUpdateManyMutationInputSchema),z.lazy(() => ConversationParticipantUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default ConversationParticipantUpdateManyWithWhereWithoutUserInputSchema;
