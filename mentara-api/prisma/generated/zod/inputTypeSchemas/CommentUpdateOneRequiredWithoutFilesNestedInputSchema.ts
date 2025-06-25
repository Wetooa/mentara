import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutFilesInputSchema } from './CommentCreateWithoutFilesInputSchema';
import { CommentUncheckedCreateWithoutFilesInputSchema } from './CommentUncheckedCreateWithoutFilesInputSchema';
import { CommentCreateOrConnectWithoutFilesInputSchema } from './CommentCreateOrConnectWithoutFilesInputSchema';
import { CommentUpsertWithoutFilesInputSchema } from './CommentUpsertWithoutFilesInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateToOneWithWhereWithoutFilesInputSchema } from './CommentUpdateToOneWithWhereWithoutFilesInputSchema';
import { CommentUpdateWithoutFilesInputSchema } from './CommentUpdateWithoutFilesInputSchema';
import { CommentUncheckedUpdateWithoutFilesInputSchema } from './CommentUncheckedUpdateWithoutFilesInputSchema';

export const CommentUpdateOneRequiredWithoutFilesNestedInputSchema: z.ZodType<Prisma.CommentUpdateOneRequiredWithoutFilesNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutFilesInputSchema).optional(),
  upsert: z.lazy(() => CommentUpsertWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommentUpdateToOneWithWhereWithoutFilesInputSchema),z.lazy(() => CommentUpdateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutFilesInputSchema) ]).optional(),
}).strict();

export default CommentUpdateOneRequiredWithoutFilesNestedInputSchema;
