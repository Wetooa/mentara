import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentCreateWithoutParentInputSchema } from './CommentCreateWithoutParentInputSchema';
import { CommentUncheckedCreateWithoutParentInputSchema } from './CommentUncheckedCreateWithoutParentInputSchema';
import { CommentCreateOrConnectWithoutParentInputSchema } from './CommentCreateOrConnectWithoutParentInputSchema';
import { CommentUpsertWithWhereUniqueWithoutParentInputSchema } from './CommentUpsertWithWhereUniqueWithoutParentInputSchema';
import { CommentCreateManyParentInputEnvelopeSchema } from './CommentCreateManyParentInputEnvelopeSchema';
import { CommentWhereUniqueInputSchema } from './CommentWhereUniqueInputSchema';
import { CommentUpdateWithWhereUniqueWithoutParentInputSchema } from './CommentUpdateWithWhereUniqueWithoutParentInputSchema';
import { CommentUpdateManyWithWhereWithoutParentInputSchema } from './CommentUpdateManyWithWhereWithoutParentInputSchema';
import { CommentScalarWhereInputSchema } from './CommentScalarWhereInputSchema';

export const CommentUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.CommentUncheckedUpdateManyWithoutParentNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentCreateWithoutParentInputSchema),z.lazy(() => CommentCreateWithoutParentInputSchema).array(),z.lazy(() => CommentUncheckedCreateWithoutParentInputSchema),z.lazy(() => CommentUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentCreateOrConnectWithoutParentInputSchema),z.lazy(() => CommentCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentUpsertWithWhereUniqueWithoutParentInputSchema),z.lazy(() => CommentUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentWhereUniqueInputSchema),z.lazy(() => CommentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentUpdateWithWhereUniqueWithoutParentInputSchema),z.lazy(() => CommentUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentUpdateManyWithWhereWithoutParentInputSchema),z.lazy(() => CommentUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentScalarWhereInputSchema),z.lazy(() => CommentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CommentUncheckedUpdateManyWithoutParentNestedInputSchema;
