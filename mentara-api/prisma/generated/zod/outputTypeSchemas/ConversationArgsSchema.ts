import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationSelectSchema } from '../inputTypeSchemas/ConversationSelectSchema';
import { ConversationIncludeSchema } from '../inputTypeSchemas/ConversationIncludeSchema';

export const ConversationArgsSchema: z.ZodType<Prisma.ConversationDefaultArgs> = z.object({
  select: z.lazy(() => ConversationSelectSchema).optional(),
  include: z.lazy(() => ConversationIncludeSchema).optional(),
}).strict();

export default ConversationArgsSchema;
