import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyCreateWithoutFilesInputSchema } from './ReplyCreateWithoutFilesInputSchema';
import { ReplyUncheckedCreateWithoutFilesInputSchema } from './ReplyUncheckedCreateWithoutFilesInputSchema';

export const ReplyCreateOrConnectWithoutFilesInputSchema: z.ZodType<Prisma.ReplyCreateOrConnectWithoutFilesInput> = z.object({
  where: z.lazy(() => ReplyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReplyCreateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutFilesInputSchema) ]),
}).strict();

export default ReplyCreateOrConnectWithoutFilesInputSchema;
