import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageCreateWithoutReadReceiptsInputSchema } from './MessageCreateWithoutReadReceiptsInputSchema';
import { MessageUncheckedCreateWithoutReadReceiptsInputSchema } from './MessageUncheckedCreateWithoutReadReceiptsInputSchema';
import { MessageCreateOrConnectWithoutReadReceiptsInputSchema } from './MessageCreateOrConnectWithoutReadReceiptsInputSchema';
import { MessageUpsertWithoutReadReceiptsInputSchema } from './MessageUpsertWithoutReadReceiptsInputSchema';
import { MessageWhereUniqueInputSchema } from './MessageWhereUniqueInputSchema';
import { MessageUpdateToOneWithWhereWithoutReadReceiptsInputSchema } from './MessageUpdateToOneWithWhereWithoutReadReceiptsInputSchema';
import { MessageUpdateWithoutReadReceiptsInputSchema } from './MessageUpdateWithoutReadReceiptsInputSchema';
import { MessageUncheckedUpdateWithoutReadReceiptsInputSchema } from './MessageUncheckedUpdateWithoutReadReceiptsInputSchema';

export const MessageUpdateOneRequiredWithoutReadReceiptsNestedInputSchema: z.ZodType<Prisma.MessageUpdateOneRequiredWithoutReadReceiptsNestedInput> = z.object({
  create: z.union([ z.lazy(() => MessageCreateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedCreateWithoutReadReceiptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => MessageCreateOrConnectWithoutReadReceiptsInputSchema).optional(),
  upsert: z.lazy(() => MessageUpsertWithoutReadReceiptsInputSchema).optional(),
  connect: z.lazy(() => MessageWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => MessageUpdateToOneWithWhereWithoutReadReceiptsInputSchema),z.lazy(() => MessageUpdateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReadReceiptsInputSchema) ]).optional(),
}).strict();

export default MessageUpdateOneRequiredWithoutReadReceiptsNestedInputSchema;
