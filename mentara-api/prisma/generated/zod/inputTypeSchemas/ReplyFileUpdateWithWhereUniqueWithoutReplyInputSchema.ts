import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyFileWhereUniqueInputSchema } from './ReplyFileWhereUniqueInputSchema';
import { ReplyFileUpdateWithoutReplyInputSchema } from './ReplyFileUpdateWithoutReplyInputSchema';
import { ReplyFileUncheckedUpdateWithoutReplyInputSchema } from './ReplyFileUncheckedUpdateWithoutReplyInputSchema';

export const ReplyFileUpdateWithWhereUniqueWithoutReplyInputSchema: z.ZodType<Prisma.ReplyFileUpdateWithWhereUniqueWithoutReplyInput> = z.object({
  where: z.lazy(() => ReplyFileWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReplyFileUpdateWithoutReplyInputSchema),z.lazy(() => ReplyFileUncheckedUpdateWithoutReplyInputSchema) ]),
}).strict();

export default ReplyFileUpdateWithWhereUniqueWithoutReplyInputSchema;
