import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutUserInputSchema } from './ClientCreateWithoutUserInputSchema';
import { ClientUncheckedCreateWithoutUserInputSchema } from './ClientUncheckedCreateWithoutUserInputSchema';
import { ClientCreateOrConnectWithoutUserInputSchema } from './ClientCreateOrConnectWithoutUserInputSchema';
import { ClientUpsertWithoutUserInputSchema } from './ClientUpsertWithoutUserInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutUserInputSchema } from './ClientUpdateToOneWithWhereWithoutUserInputSchema';
import { ClientUpdateWithoutUserInputSchema } from './ClientUpdateWithoutUserInputSchema';
import { ClientUncheckedUpdateWithoutUserInputSchema } from './ClientUncheckedUpdateWithoutUserInputSchema';

export const ClientUncheckedUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.ClientUncheckedUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutUserInputSchema),z.lazy(() => ClientUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ClientWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => ClientUpdateWithoutUserInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export default ClientUncheckedUpdateOneWithoutUserNestedInputSchema;
