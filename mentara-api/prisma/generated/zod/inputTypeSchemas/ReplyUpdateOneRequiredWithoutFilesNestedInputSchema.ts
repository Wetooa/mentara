import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutFilesInputSchema } from './ReplyCreateWithoutFilesInputSchema';
import { ReplyUncheckedCreateWithoutFilesInputSchema } from './ReplyUncheckedCreateWithoutFilesInputSchema';
import { ReplyCreateOrConnectWithoutFilesInputSchema } from './ReplyCreateOrConnectWithoutFilesInputSchema';
import { ReplyUpsertWithoutFilesInputSchema } from './ReplyUpsertWithoutFilesInputSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateToOneWithWhereWithoutFilesInputSchema } from './ReplyUpdateToOneWithWhereWithoutFilesInputSchema';
import { ReplyUpdateWithoutFilesInputSchema } from './ReplyUpdateWithoutFilesInputSchema';
import { ReplyUncheckedUpdateWithoutFilesInputSchema } from './ReplyUncheckedUpdateWithoutFilesInputSchema';

export const ReplyUpdateOneRequiredWithoutFilesNestedInputSchema: z.ZodType<Prisma.ReplyUpdateOneRequiredWithoutFilesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReplyCreateOrConnectWithoutFilesInputSchema).optional(),
  upsert: z.lazy(() => ReplyUpsertWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => ReplyWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReplyUpdateToOneWithWhereWithoutFilesInputSchema),z.lazy(() => ReplyUpdateWithoutFilesInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutFilesInputSchema) ]).optional(),
}).strict();

export default ReplyUpdateOneRequiredWithoutFilesNestedInputSchema;
