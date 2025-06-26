import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ConversationWhereInputSchema } from './ConversationWhereInputSchema';
import { ConversationUpdateWithoutParticipantsInputSchema } from './ConversationUpdateWithoutParticipantsInputSchema';
import { ConversationUncheckedUpdateWithoutParticipantsInputSchema } from './ConversationUncheckedUpdateWithoutParticipantsInputSchema';

export const ConversationUpdateToOneWithWhereWithoutParticipantsInputSchema: z.ZodType<Prisma.ConversationUpdateToOneWithWhereWithoutParticipantsInput> = z.object({
  where: z.lazy(() => ConversationWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ConversationUpdateWithoutParticipantsInputSchema),z.lazy(() => ConversationUncheckedUpdateWithoutParticipantsInputSchema) ]),
}).strict();

export default ConversationUpdateToOneWithWhereWithoutParticipantsInputSchema;
