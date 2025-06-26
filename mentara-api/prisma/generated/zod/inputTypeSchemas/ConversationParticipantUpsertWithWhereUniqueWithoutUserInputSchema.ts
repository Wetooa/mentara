import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantUpdateWithoutUserInputSchema } from './ConversationParticipantUpdateWithoutUserInputSchema';
import { ConversationParticipantUncheckedUpdateWithoutUserInputSchema } from './ConversationParticipantUncheckedUpdateWithoutUserInputSchema';
import { ConversationParticipantCreateWithoutUserInputSchema } from './ConversationParticipantCreateWithoutUserInputSchema';
import { ConversationParticipantUncheckedCreateWithoutUserInputSchema } from './ConversationParticipantUncheckedCreateWithoutUserInputSchema';

export const ConversationParticipantUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ConversationParticipantUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ConversationParticipantWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ConversationParticipantUpdateWithoutUserInputSchema),z.lazy(() => ConversationParticipantUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutUserInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ConversationParticipantUpsertWithWhereUniqueWithoutUserInputSchema;
