import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantCreateWithoutConversationInputSchema } from './ConversationParticipantCreateWithoutConversationInputSchema';
import { ConversationParticipantUncheckedCreateWithoutConversationInputSchema } from './ConversationParticipantUncheckedCreateWithoutConversationInputSchema';
import { ConversationParticipantCreateOrConnectWithoutConversationInputSchema } from './ConversationParticipantCreateOrConnectWithoutConversationInputSchema';
import { ConversationParticipantUpsertWithWhereUniqueWithoutConversationInputSchema } from './ConversationParticipantUpsertWithWhereUniqueWithoutConversationInputSchema';
import { ConversationParticipantCreateManyConversationInputEnvelopeSchema } from './ConversationParticipantCreateManyConversationInputEnvelopeSchema';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantUpdateWithWhereUniqueWithoutConversationInputSchema } from './ConversationParticipantUpdateWithWhereUniqueWithoutConversationInputSchema';
import { ConversationParticipantUpdateManyWithWhereWithoutConversationInputSchema } from './ConversationParticipantUpdateManyWithWhereWithoutConversationInputSchema';
import { ConversationParticipantScalarWhereInputSchema } from './ConversationParticipantScalarWhereInputSchema';

export const ConversationParticipantUncheckedUpdateManyWithoutConversationNestedInputSchema: z.ZodType<Prisma.ConversationParticipantUncheckedUpdateManyWithoutConversationNestedInput> = z.object({
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantCreateWithoutConversationInputSchema).array(),z.lazy(() => ConversationParticipantUncheckedCreateWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutConversationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ConversationParticipantCreateOrConnectWithoutConversationInputSchema),z.lazy(() => ConversationParticipantCreateOrConnectWithoutConversationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ConversationParticipantUpsertWithWhereUniqueWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUpsertWithWhereUniqueWithoutConversationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ConversationParticipantCreateManyConversationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ConversationParticipantUpdateWithWhereUniqueWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUpdateWithWhereUniqueWithoutConversationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ConversationParticipantUpdateManyWithWhereWithoutConversationInputSchema),z.lazy(() => ConversationParticipantUpdateManyWithWhereWithoutConversationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ConversationParticipantScalarWhereInputSchema),z.lazy(() => ConversationParticipantScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ConversationParticipantUncheckedUpdateManyWithoutConversationNestedInputSchema;
