import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantCreateWithoutUserInputSchema } from './ConversationParticipantCreateWithoutUserInputSchema';
import { ConversationParticipantUncheckedCreateWithoutUserInputSchema } from './ConversationParticipantUncheckedCreateWithoutUserInputSchema';

export const ConversationParticipantCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ConversationParticipantCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ConversationParticipantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutUserInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ConversationParticipantCreateOrConnectWithoutUserInputSchema;
