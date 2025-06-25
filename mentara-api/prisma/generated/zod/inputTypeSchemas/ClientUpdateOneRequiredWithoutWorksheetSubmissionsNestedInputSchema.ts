import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutWorksheetSubmissionsInputSchema } from './ClientCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema } from './ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema';
import { ClientUpsertWithoutWorksheetSubmissionsInputSchema } from './ClientUpsertWithoutWorksheetSubmissionsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutWorksheetSubmissionsInputSchema } from './ClientUpdateToOneWithWhereWithoutWorksheetSubmissionsInputSchema';
import { ClientUpdateWithoutWorksheetSubmissionsInputSchema } from './ClientUpdateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema';

export const ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutWorksheetSubmissionsInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutWorksheetSubmissionsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUpdateWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutWorksheetSubmissionsNestedInputSchema;
