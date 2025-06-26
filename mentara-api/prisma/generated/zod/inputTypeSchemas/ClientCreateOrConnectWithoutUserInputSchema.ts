import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientCreateWithoutUserInputSchema } from './ClientCreateWithoutUserInputSchema';
import { ClientUncheckedCreateWithoutUserInputSchema } from './ClientUncheckedCreateWithoutUserInputSchema';

export const ClientCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ClientCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ClientWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ClientCreateWithoutUserInputSchema),z.lazy(() => ClientUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ClientCreateOrConnectWithoutUserInputSchema;
