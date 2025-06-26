import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageCreateWithoutReadReceiptsInputSchema } from './MessageCreateWithoutReadReceiptsInputSchema';
import { MessageUncheckedCreateWithoutReadReceiptsInputSchema } from './MessageUncheckedCreateWithoutReadReceiptsInputSchema';

export const MessageCreateOrConnectWithoutReadReceiptsInputSchema: z.ZodType<Prisma.MessageCreateOrConnectWithoutReadReceiptsInput> = z.object({
  where: z.lazy(() => MessageWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MessageCreateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReadReceiptsInputSchema) ]),
}).strict();

export default MessageCreateOrConnectWithoutReadReceiptsInputSchema;
