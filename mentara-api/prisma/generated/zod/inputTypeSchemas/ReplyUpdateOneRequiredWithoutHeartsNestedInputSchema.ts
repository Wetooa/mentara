import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReplyCreateWithoutHeartsInputSchema } from './ReplyCreateWithoutHeartsInputSchema';
import { ReplyUncheckedCreateWithoutHeartsInputSchema } from './ReplyUncheckedCreateWithoutHeartsInputSchema';
import { ReplyCreateOrConnectWithoutHeartsInputSchema } from './ReplyCreateOrConnectWithoutHeartsInputSchema';
import { ReplyUpsertWithoutHeartsInputSchema } from './ReplyUpsertWithoutHeartsInputSchema';
import { ReplyWhereUniqueInputSchema } from './ReplyWhereUniqueInputSchema';
import { ReplyUpdateToOneWithWhereWithoutHeartsInputSchema } from './ReplyUpdateToOneWithWhereWithoutHeartsInputSchema';
import { ReplyUpdateWithoutHeartsInputSchema } from './ReplyUpdateWithoutHeartsInputSchema';
import { ReplyUncheckedUpdateWithoutHeartsInputSchema } from './ReplyUncheckedUpdateWithoutHeartsInputSchema';

export const ReplyUpdateOneRequiredWithoutHeartsNestedInputSchema: z.ZodType<Prisma.ReplyUpdateOneRequiredWithoutHeartsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReplyCreateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedCreateWithoutHeartsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReplyCreateOrConnectWithoutHeartsInputSchema).optional(),
  upsert: z.lazy(() => ReplyUpsertWithoutHeartsInputSchema).optional(),
  connect: z.lazy(() => ReplyWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReplyUpdateToOneWithWhereWithoutHeartsInputSchema),z.lazy(() => ReplyUpdateWithoutHeartsInputSchema),z.lazy(() => ReplyUncheckedUpdateWithoutHeartsInputSchema) ]).optional(),
}).strict();

export default ReplyUpdateOneRequiredWithoutHeartsNestedInputSchema;
