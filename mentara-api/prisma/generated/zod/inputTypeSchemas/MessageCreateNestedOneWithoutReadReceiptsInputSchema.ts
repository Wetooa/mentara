import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutReadReceiptsInputSchema } from './MessageCreateWithoutReadReceiptsInputSchema';
import { MessageUncheckedCreateWithoutReadReceiptsInputSchema } from './MessageUncheckedCreateWithoutReadReceiptsInputSchema';
import { MessageCreateOrConnectWithoutReadReceiptsInputSchema } from './MessageCreateOrConnectWithoutReadReceiptsInputSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';

export const MessageCreateNestedOneWithoutReadReceiptsInputSchema: z.ZodType<Prisma.MessageCreateNestedOneWithoutReadReceiptsInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReadReceiptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MessageCreateOrConnectWithoutReadReceiptsInputSchema).optional(),
  connect: z.lazy(() => MessageWhereUniqueInputSchema).optional()
}).strict();

export default MessageCreateNestedOneWithoutReadReceiptsInputSchema;
