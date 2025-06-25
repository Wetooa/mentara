import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentCreateWithoutFilesInputSchema } from './CommentCreateWithoutFilesInputSchema';
import { CommentUncheckedCreateWithoutFilesInputSchema } from './CommentUncheckedCreateWithoutFilesInputSchema';

export const CommentCreateOrConnectWithoutFilesInputSchema: z.ZodType<Prisma.CommentCreateOrConnectWithoutFilesInput> = z.object({
  where: z.lazy(() => CommentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CommentCreateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutFilesInputSchema) ]),
}).strict();

export default CommentCreateOrConnectWithoutFilesInputSchema;
