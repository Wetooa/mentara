import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationCreateWithoutParticipantsInputSchema } from './ConversationCreateWithoutParticipantsInputSchema';
import { ConversationUncheckedCreateWithoutParticipantsInputSchema } from './ConversationUncheckedCreateWithoutParticipantsInputSchema';
import { ConversationCreateOrConnectWithoutParticipantsInputSchema } from './ConversationCreateOrConnectWithoutParticipantsInputSchema';
import { ConversationUpsertWithoutParticipantsInputSchema } from './ConversationUpsertWithoutParticipantsInputSchema';
import { ConversationWhereUniqueInputSchema } from './ConversationWhereUniqueInputSchema';
import { ConversationUpdateToOneWithWhereWithoutParticipantsInputSchema } from './ConversationUpdateToOneWithWhereWithoutParticipantsInputSchema';
import { ConversationUpdateWithoutParticipantsInputSchema } from './ConversationUpdateWithoutParticipantsInputSchema';
import { ConversationUncheckedUpdateWithoutParticipantsInputSchema } from './ConversationUncheckedUpdateWithoutParticipantsInputSchema';

export const ConversationUpdateOneRequiredWithoutParticipantsNestedInputSchema: z.ZodType<Prisma.ConversationUpdateOneRequiredWithoutParticipantsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ConversationCreateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutParticipantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ConversationCreateOrConnectWithoutParticipantsInputSchema).optional(),
  upsert: z.lazy(() => ConversationUpsertWithoutParticipantsInputSchema).optional(),
  connect: z.lazy(() => ConversationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ConversationUpdateToOneWithWhereWithoutParticipantsInputSchema),z.lazy(() => ConversationUpdateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedUpdateWithoutParticipantsInputSchema) ]).optional(),
}).strict();

export default ConversationUpdateOneRequiredWithoutParticipantsNestedInputSchema;
