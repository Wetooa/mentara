import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantSelectSchema } from '../inputTypeSchemas/ConversationParticipantSelectSchema';
import { ConversationParticipantIncludeSchema } from '../inputTypeSchemas/ConversationParticipantIncludeSchema';

export const ConversationParticipantArgsSchema: z.ZodType<Prisma.ConversationParticipantDefaultArgs> = z.object({
  select: z.lazy(() => ConversationParticipantSelectSchema).optional(),
  include: z.lazy(() => ConversationParticipantIncludeSchema).optional(),
}).strict();

export default ConversationParticipantArgsSchema;
