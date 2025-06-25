import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutWorksheetsInputSchema } from './ClientCreateWithoutWorksheetsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetsInputSchema } from './ClientUncheckedCreateWithoutWorksheetsInputSchema';
import { ClientCreateOrConnectWithoutWorksheetsInputSchema } from './ClientCreateOrConnectWithoutWorksheetsInputSchema';
import { ClientUpsertWithoutWorksheetsInputSchema } from './ClientUpsertWithoutWorksheetsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutWorksheetsInputSchema } from './ClientUpdateToOneWithWhereWithoutWorksheetsInputSchema';
import { ClientUpdateWithoutWorksheetsInputSchema } from './ClientUpdateWithoutWorksheetsInputSchema';
import { ClientUncheckedUpdateWithoutWorksheetsInputSchema } from './ClientUncheckedUpdateWithoutWorksheetsInputSchema';

export const ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutWorksheetsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutWorksheetsInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutWorksheetsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutWorksheetsInputSchema),z.lazy(() => ClientUpdateWithoutWorksheetsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutWorksheetsInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutWorksheetsNestedInputSchema;
