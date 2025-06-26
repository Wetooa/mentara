import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutFilesInputSchema } from './CommentCreateWithoutFilesInputSchema';
import { CommentUncheckedCreateWithoutFilesInputSchema } from './CommentUncheckedCreateWithoutFilesInputSchema';
import { CommentCreateOrConnectWithoutFilesInputSchema } from './CommentCreateOrConnectWithoutFilesInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';

export const CommentCreateNestedOneWithoutFilesInputSchema: z.ZodType<Prisma.CommentCreateNestedOneWithoutFilesInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutFilesInputSchema),z.lazy(() => CommentUncheckedCreateWithoutFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutFilesInputSchema).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional()
}).strict();

export default CommentCreateNestedOneWithoutFilesInputSchema;
