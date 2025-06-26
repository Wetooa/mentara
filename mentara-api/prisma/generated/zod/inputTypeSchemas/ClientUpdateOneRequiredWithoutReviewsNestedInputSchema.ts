import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutReviewsInputSchema } from './ClientCreateWithoutReviewsInputSchema';
import { ClientUncheckedCreateWithoutReviewsInputSchema } from './ClientUncheckedCreateWithoutReviewsInputSchema';
import { ClientCreateOrConnectWithoutReviewsInputSchema } from './ClientCreateOrConnectWithoutReviewsInputSchema';
import { ClientUpsertWithoutReviewsInputSchema } from './ClientUpsertWithoutReviewsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutReviewsInputSchema } from './ClientUpdateToOneWithWhereWithoutReviewsInputSchema';
import { ClientUpdateWithoutReviewsInputSchema } from './ClientUpdateWithoutReviewsInputSchema';
import { ClientUncheckedUpdateWithoutReviewsInputSchema } from './ClientUncheckedUpdateWithoutReviewsInputSchema';

export const ClientUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutReviewsInputSchema),z.lazy(() => ClientUpdateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutReviewsNestedInputSchema;
