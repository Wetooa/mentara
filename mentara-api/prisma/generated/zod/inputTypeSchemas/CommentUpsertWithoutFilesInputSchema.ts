import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUpdateWithoutFilesInputSchema } from './CommentUpdateWithoutFilesInputSchema';
import { CommentUncheckedUpdateWithoutFilesInputSchema } from './CommentUncheckedUpdateWithoutFilesInputSchema';
import { CommentCreateWithoutFilesInputSchema } from './CommentCreateWithoutFilesInputSchema';
import { CommentUncheckedCreateWithoutFilesInputSchema } from './CommentUncheckedCreateWithoutFilesInputSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentUpsertWithoutFilesInputSchema: z.ZodType<Prisma.CommentUpsertWithoutFilesInput> = z.object({
  update: z.union([ z.lazy(() => CommentUpdateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutFilesInputSchema) ]),
  create: z.union([ z.lazy(() => CommentCreateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutFilesInputSchema) ]),
  where: z.lazy(() => CommentWhereInputSchema).optional()
}).strict();

export default CommentUpsertWithoutFilesInputSchema;
