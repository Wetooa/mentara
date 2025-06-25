import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutWorksheetSubmissionsInputSchema } from './ClientUpdateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema';
import { ClientCreateWithoutWorksheetSubmissionsInputSchema } from './ClientCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutWorksheetSubmissionsInputSchema: z.ZodType<Prisma.ClientUpsertWithoutWorksheetSubmissionsInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutWorksheetSubmissionsInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutWorksheetSubmissionsInputSchema;
