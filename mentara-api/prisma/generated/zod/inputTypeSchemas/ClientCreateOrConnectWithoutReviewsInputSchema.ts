import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutReviewsInputSchema } from './ClientCreateWithoutReviewsInputSchema';
import { ClientUncheckedCreateWithoutReviewsInputSchema } from './ClientUncheckedCreateWithoutReviewsInputSchema';

export const ClientCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutReviewsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutReviewsInputSchema;
