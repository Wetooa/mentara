import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';
import { ReplyUpdateWithoutFilesInputSchema } from './ReplyUpdateWithoutFilesInputSchema';
import { ReplyUncheckedUpdateWithoutFilesInputSchema } from './ReplyUncheckedUpdateWithoutFilesInputSchema';

export const ReplyUpdateToOneWithWhereWithoutFilesInputSchema: z.ZodType<Prisma.ReplyUpdateToOneWithWhereWithoutFilesInput> = z.object({
  where: z.lazy(() => ReplyWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReplyUpdateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutFilesInputSchema) ]),
}).strict();

export default ReplyUpdateToOneWithWhereWithoutFilesInputSchema;
