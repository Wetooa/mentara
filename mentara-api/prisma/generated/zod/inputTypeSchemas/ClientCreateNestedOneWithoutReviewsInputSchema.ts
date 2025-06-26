import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutReviewsInputSchema } from './ClientCreateWithoutReviewsInputSchema';
import { ClientUncheckedCreateWithoutReviewsInputSchema } from './ClientUncheckedCreateWithoutReviewsInputSchema';
import { ClientCreateOrConnectWithoutReviewsInputSchema } from './ClientCreateOrConnectWithoutReviewsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutReviewsInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutReviewsInputSchema;
