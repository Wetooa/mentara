import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageUpdateWithoutReadReceiptsInputSchema } from './MessageUpdateWithoutReadReceiptsInputSchema';
import { MessageUncheckedUpdateWithoutReadReceiptsInputSchema } from './MessageUncheckedUpdateWithoutReadReceiptsInputSchema';
import { MessageCreateWithoutReadReceiptsInputSchema } from './MessageCreateWithoutReadReceiptsInputSchema';
import { MessageUncheckedCreateWithoutReadReceiptsInputSchema } from './MessageUncheckedCreateWithoutReadReceiptsInputSchema';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';

export const MessageUpsertWithoutReadReceiptsInputSchema: z.ZodType<Prisma.MessageUpsertWithoutReadReceiptsInput> = z.object({
  update: z.union([ z.lazy(() => MessageUpdateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReadReceiptsInputSchema) ]),
  create: z.union([ z.lazy(() => MessageCreateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReadReceiptsInputSchema) ]),
  where: z.lazy(() => MessageWhereInputSchema).optional()
}).strict();

export default MessageUpsertWithoutReadReceiptsInputSchema;
