import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationUpdateWithoutParticipantsInputSchema } from './ConversationUpdateWithoutParticipantsInputSchema';
import { ConversationUncheckedUpdateWithoutParticipantsInputSchema } from './ConversationUncheckedUpdateWithoutParticipantsInputSchema';
import { ConversationCreateWithoutParticipantsInputSchema } from './ConversationCreateWithoutParticipantsInputSchema';
import { ConversationUncheckedCreateWithoutParticipantsInputSchema } from './ConversationUncheckedCreateWithoutParticipantsInputSchema';
import { ConversationWhereInputSchema } from './ConversationWhereInputSchema';

export const ConversationUpsertWithoutParticipantsInputSchema: z.ZodType<Prisma.ConversationUpsertWithoutParticipantsInput> = z.object({
  update: z.union([ z.lazy(() => ConversationUpdateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedUpdateWithoutParticipantsInputSchema) ]),
  create: z.union([ z.lazy(() => ConversationCreateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedCreateWithoutParticipantsInputSchema) ]),
  where: z.lazy(() => ConversationWhereInputSchema).optional()
}).strict();

export default ConversationUpsertWithoutParticipantsInputSchema;
