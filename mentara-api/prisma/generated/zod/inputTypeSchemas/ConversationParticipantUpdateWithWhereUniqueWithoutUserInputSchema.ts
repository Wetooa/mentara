import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantUpdateWithoutUserInputSchema } from './ConversationParticipantUpdateWithoutUserInputSchema';
import { ConversationParticipantUncheckedUpdateWithoutUserInputSchema } from './ConversationParticipantUncheckedUpdateWithoutUserInputSchema';

export const ConversationParticipantUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ConversationParticipantUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ConversationParticipantWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ConversationParticipantUpdateWithoutUserInputSchema),z.lazy(() => ConversationParticipantUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ConversationParticipantUpdateWithWhereUniqueWithoutUserInputSchema;
