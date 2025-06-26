import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationParticipantCreateWithoutUserInputSchema } from './ConversationParticipantCreateWithoutUserInputSchema';
import { ConversationParticipantUncheckedCreateWithoutUserInputSchema } from './ConversationParticipantUncheckedCreateWithoutUserInputSchema';
import { ConversationParticipantCreateOrConnectWithoutUserInputSchema } from './ConversationParticipantCreateOrConnectWithoutUserInputSchema';
import { ConversationParticipantUpsertWithWhereUniqueWithoutUserInputSchema } from './ConversationParticipantUpsertWithWhereUniqueWithoutUserInputSchema';
import { ConversationParticipantCreateManyUserInputEnvelopeSchema } from './ConversationParticipantCreateManyUserInputEnvelopeSchema';
import { ConversationParticipantWhereUniqueInputSchema } from './ConversationParticipantWhereUniqueInputSchema';
import { ConversationParticipantUpdateWithWhereUniqueWithoutUserInputSchema } from './ConversationParticipantUpdateWithWhereUniqueWithoutUserInputSchema';
import { ConversationParticipantUpdateManyWithWhereWithoutUserInputSchema } from './ConversationParticipantUpdateManyWithWhereWithoutUserInputSchema';
import { ConversationParticipantScalarWhereInputSchema } from './ConversationParticipantScalarWhereInputSchema';

export const ConversationParticipantUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ConversationParticipantUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ConversationParticipantCreateWithoutUserInputSchema),z.lazy(() => ConversationParticipantCreateWithoutUserInputSchema).array(),z.lazy(() => ConversationParticipantUncheckedCreateWithoutUserInputSchema),z.lazy(() => ConversationParticipantUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ConversationParticipantCreateOrConnectWithoutUserInputSchema),z.lazy(() => ConversationParticipantCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ConversationParticipantUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ConversationParticipantUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ConversationParticipantCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ConversationParticipantWhereUniqueInputSchema),z.lazy(() => ConversationParticipantWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ConversationParticipantUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ConversationParticipantUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ConversationParticipantUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ConversationParticipantUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ConversationParticipantScalarWhereInputSchema),z.lazy(() => ConversationParticipantScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ConversationParticipantUpdateManyWithoutUserNestedInputSchema;
