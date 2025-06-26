import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyUpdateWithoutFilesInputSchema } from './ReplyUpdateWithoutFilesInputSchema';
import { ReplyUncheckedUpdateWithoutFilesInputSchema } from './ReplyUncheckedUpdateWithoutFilesInputSchema';
import { ReplyCreateWithoutFilesInputSchema } from './ReplyCreateWithoutFilesInputSchema';
import { ReplyUncheckedCreateWithoutFilesInputSchema } from './ReplyUncheckedCreateWithoutFilesInputSchema';
import { ReplyWhereInputSchema } from './ReplyWhereInputSchema';

export const ReplyUpsertWithoutFilesInputSchema: z.ZodType<Prisma.ReplyUpsertWithoutFilesInput> = z.object({
  update: z.union([ z.lazy(() => ReplyUpdateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutFilesInputSchema) ]),
  create: z.union([ z.lazy(() => ReplyCreateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutFilesInputSchema) ]),
  where: z.lazy(() => ReplyWhereInputSchema).optional()
}).strict();

export default ReplyUpsertWithoutFilesInputSchema;
