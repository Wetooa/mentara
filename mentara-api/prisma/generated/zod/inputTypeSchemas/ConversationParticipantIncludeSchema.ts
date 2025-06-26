import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationArgsSchema } from "../outputTypeSchemas/ConversationArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ConversationParticipantIncludeSchema: z.ZodType<Prisma.ConversationParticipantInclude> = z.object({
  conversation: z.union([z.boolean(),z.lazy(() => ConversationArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ConversationParticipantIncludeSchema;
