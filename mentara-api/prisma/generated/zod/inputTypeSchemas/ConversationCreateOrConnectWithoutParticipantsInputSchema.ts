import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationWhereUniqueInputSchema } from './ConversationWhereUniqueInputSchema';
import { ConversationCreateWithoutParticipantsInputSchema } from './ConversationCreateWithoutParticipantsInputSchema';
import { ConversationUncheckedCreateWithoutParticipantsInputSchema } from './ConversationUncheckedCreateWithoutParticipantsInputSchema';

export const ConversationCreateOrConnectWithoutParticipantsInputSchema: z.ZodType<Prisma.ConversationCreateOrConnectWithoutParticipantsInput> = z.object({
  where: z.lazy(() => ConversationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ConversationCreateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutParticipantsInputSchema) ]),
}).strict();

export default ConversationCreateOrConnectWithoutParticipantsInputSchema;
