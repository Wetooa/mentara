import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantCreateWithoutConversationInputSchema } from './ConversationParticipantCreateWithoutConversationInputSchema';
import { ConversationParticipantUncheckedCreateWithoutConversationInputSchema } from './ConversationParticipantUncheckedCreateWithoutConversationInputSchema';
import { ConversationParticipantCreateOrConnectWithoutConversationInputSchema } from './ConversationParticipantCreateOrConnectWithoutConversationInputSchema';
import { ConversationParticipantCreateManyConversationInputEnvelopeSchema } from './ConversationParticipantCreateManyConversationInputEnvelopeSchema';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';

export const ConversationParticipantCreateNestedManyWithoutConversationInputSchema: z.ZodType<Prisma.ConversationParticipantCreateNestedManyWithoutConversationInput> = z.object({
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantCreateWithoutConversationInputSchema).array(),z.lazy(() => ConversationParticipantUncheckedCreateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutConversationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ConversationParticipantCreateOrConnectWithoutConversationInputSchema),z.lazy(() => ConversationParticipantCreateOrConnectWithoutConversationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ConversationParticipantCreateManyConversationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ConversationParticipantCreateNestedManyWithoutConversationInputSchema;
