import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutFilesInputSchema } from './ReplyCreateWithoutFilesInputSchema';
import { ReplyUncheckedCreateWithoutFilesInputSchema } from './ReplyUncheckedCreateWithoutFilesInputSchema';
import { ReplyCreateOrConnectWithoutFilesInputSchema } from './ReplyCreateOrConnectWithoutFilesInputSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';

export const ReplyCreateNestedOneWithoutFilesInputSchema: z.ZodType<Prisma.ReplyCreateNestedOneWithoutFilesInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReplyCreateOrConnectWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => ReplyWhereUniqueInputSchema).optional()
}).strict();

export default ReplyCreateNestedOneWithoutFilesInputSchema;
