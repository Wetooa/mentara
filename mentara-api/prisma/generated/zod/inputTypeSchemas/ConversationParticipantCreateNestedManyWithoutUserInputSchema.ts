import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantCreateWithoutUserInputSchema } from './ConversationParticipantCreateWithoutUserInputSchema';
import { ConversationParticipantUncheckedCreateWithoutUserInputSchema } from './ConversationParticipantUncheckedCreateWithoutUserInputSchema';
import { ConversationParticipantCreateOrConnectWithoutUserInputSchema } from './ConversationParticipantCreateOrConnectWithoutUserInputSchema';
import { ConversationParticipantCreateManyUserInputEnvelopeSchema } from './ConversationParticipantCreateManyUserInputEnvelopeSchema';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';

export const ConversationParticipantCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ConversationParticipantCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutUserInputSchema),z.lazy(() => ConversationParticipantCreateWithoutUserInputSchema).array(),z.lazy(() => ConversationParticipantUncheckedCreateWithoutUserInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ConversationParticipantCreateOrConnectWithoutUserInputSchema),z.lazy(() => ConversationParticipantCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ConversationParticipantCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ConversationParticipantCreateNestedManyWithoutUserInputSchema;
