import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationCreateWithoutParticipantsInputSchema } from './ConversationCreateWithoutParticipantsInputSchema';
import { ConversationUncheckedCreateWithoutParticipantsInputSchema } from './ConversationUncheckedCreateWithoutParticipantsInputSchema';
import { ConversationCreateOrConnectWithoutParticipantsInputSchema } from './ConversationCreateOrConnectWithoutParticipantsInputSchema';
import { ConversationWhereUniqueInputSchema } from './ConversationWhereUniqueInputSchema';

export const ConversationCreateNestedOneWithoutParticipantsInputSchema: z.ZodType<Prisma.ConversationCreateNestedOneWithoutParticipantsInput> = z.object({
  create: z.union([ z.lazy(() => ConversationCreateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutParticipantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ConversationCreateOrConnectWithoutParticipantsInputSchema).optional(),
  connect: z.lazy(() => ConversationWhereUniqueInputSchema).optional()
}).strict();

export default ConversationCreateNestedOneWithoutParticipantsInputSchema;
