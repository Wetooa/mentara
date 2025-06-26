import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { MessageWhereInputSchema } from './MessageWhereInputSchema';
import { MessageUpdateWithoutReadReceiptsInputSchema } from './MessageUpdateWithoutReadReceiptsInputSchema';
import { MessageUncheckedUpdateWithoutReadReceiptsInputSchema } from './MessageUncheckedUpdateWithoutReadReceiptsInputSchema';

export const MessageUpdateToOneWithWhereWithoutReadReceiptsInputSchema: z.ZodType<Prisma.MessageUpdateToOneWithWhereWithoutReadReceiptsInput> = z.object({
  where: z.lazy(() => MessageWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => MessageUpdateWithoutReadReceiptsInputSchema),z.lazy(() => MessageUncheckedUpdateWithoutReadReceiptsInputSchema) ]),
}).strict();

export default MessageUpdateToOneWithWhereWithoutReadReceiptsInputSchema;
