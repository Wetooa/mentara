import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutUserInputSchema } from './ClientCreateWithoutUserInputSchema';
import { ClientUncheckedCreateWithoutUserInputSchema } from './ClientUncheckedCreateWithoutUserInputSchema';
import { ClientCreateOrConnectWithoutUserInputSchema } from './ClientCreateOrConnectWithoutUserInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';

export const ClientCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.ClientCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutUserInputSchema),z.lazy(() => ClientUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional()
}).strict();

export default ClientCreateNestedOneWithoutUserInputSchema;
