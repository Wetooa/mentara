import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationParticipantFindManyArgsSchema } from "../outputTypeSchemas/ConversationParticipantFindManyArgsSchema"
import { MessageFindManyArgsSchema } from "../outputTypeSchemas/MessageFindManyArgsSchema"
import { ConversationCountOutputTypeArgsSchema } from "../outputTypeSchemas/ConversationCountOutputTypeArgsSchema"

export const ConversationIncludeSchema: z.ZodType<Prisma.ConversationInclude> = z.object({
  participants: z.union([z.boolean(),z.lazy(() => ConversationParticipantFindManyArgsSchema)]).optional(),
  messages: z.union([z.boolean(),z.lazy(() => MessageFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ConversationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ConversationIncludeSchema;
