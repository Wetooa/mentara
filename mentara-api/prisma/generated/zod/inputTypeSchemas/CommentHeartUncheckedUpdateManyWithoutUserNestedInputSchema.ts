import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCreateWithoutUserInputSchema } from './CommentHeartCreateWithoutUserInputSchema';
import { CommentHeartUncheckedCreateWithoutUserInputSchema } from './CommentHeartUncheckedCreateWithoutUserInputSchema';
import { CommentHeartCreateOrConnectWithoutUserInputSchema } from './CommentHeartCreateOrConnectWithoutUserInputSchema';
import { CommentHeartUpsertWithWhereUniqueWithoutUserInputSchema } from './CommentHeartUpsertWithWhereUniqueWithoutUserInputSchema';
import { CommentHeartCreateManyUserInputEnvelopeSchema } from './CommentHeartCreateManyUserInputEnvelopeSchema';
import { CommentHeartWhereUniqueInputSchema } from './CommentHeartWhereUniqueInputSchema';
import { CommentHeartUpdateWithWhereUniqueWithoutUserInputSchema } from './CommentHeartUpdateWithWhereUniqueWithoutUserInputSchema';
import { CommentHeartUpdateManyWithWhereWithoutUserInputSchema } from './CommentHeartUpdateManyWithWhereWithoutUserInputSchema';
import { CommentHeartScalarWhereInputSchema } from './CommentHeartScalarWhereInputSchema';

export const CommentHeartUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CommentHeartUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => CommentHeartCreateWithoutUserInputSchema),z.lazy(() => CommentHeartCreateWithoutUserInputSchema).array(),z.lazy(() => CommentHeartUncheckedCreateWithoutUserInputSchema),z.lazy(() => CommentHeartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CommentHeartCreateOrConnectWithoutUserInputSchema),z.lazy(() => CommentHeartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CommentHeartUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentHeartUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CommentHeartCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CommentHeartWhereUniqueInputSchema),z.lazy(() => CommentHeartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CommentHeartUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CommentHeartUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CommentHeartUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => CommentHeartUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CommentHeartScalarWhereInputSchema),z.lazy(() => CommentHeartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CommentHeartUncheckedUpdateManyWithoutUserNestedInputSchema;
