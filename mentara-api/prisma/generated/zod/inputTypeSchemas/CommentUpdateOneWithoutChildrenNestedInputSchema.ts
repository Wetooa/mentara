import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutChildrenInputSchema } from './CommentCreateWithoutChildrenInputSchema';
import { CommentUncheckedCreateWithoutChildrenInputSchema } from './CommentUncheckedCreateWithoutChildrenInputSchema';
import { CommentCreateOrConnectWithoutChildrenInputSchema } from './CommentCreateOrConnectWithoutChildrenInputSchema';
import { CommentUpsertWithoutChildrenInputSchema } from './CommentUpsertWithoutChildrenInputSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateToOneWithWhereWithoutChildrenInputSchema } from './CommentUpdateToOneWithWhereWithoutChildrenInputSchema';
import { CommentUpdateWithoutChildrenInputSchema } from './CommentUpdateWithoutChildrenInputSchema';
import { CommentUncheckedUpdateWithoutChildrenInputSchema } from './CommentUncheckedUpdateWithoutChildrenInputSchema';

export const CommentUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.CommentUpdateOneWithoutChildrenNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CommentCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => CommentUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CommentWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CommentWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CommentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CommentUpdateToOneWithWhereWithoutChildrenInputSchema),z.lazy(() => CommentUpdateWithoutChildrenInputSchema),z.lazy(() => CommentUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
}).strict();

export default CommentUpdateOneWithoutChildrenNestedInputSchema;
