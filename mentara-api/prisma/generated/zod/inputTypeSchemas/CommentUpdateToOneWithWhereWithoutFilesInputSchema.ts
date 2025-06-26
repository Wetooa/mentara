import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { CommentUpdateWithoutFilesInputSchema } from './CommentUpdateWithoutFilesInputSchema';
import { CommentUncheckedUpdateWithoutFilesInputSchema } from './CommentUncheckedUpdateWithoutFilesInputSchema';

export const CommentUpdateToOneWithWhereWithoutFilesInputSchema: z.ZodType<Prisma.CommentUpdateToOneWithWhereWithoutFilesInput> = z.object({
  where: z.lazy(() => CommentWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CommentUpdateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutFilesInputSchema) ]),
}).strict();

export default CommentUpdateToOneWithWhereWithoutFilesInputSchema;
