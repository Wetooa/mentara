import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutWorksheetSubmissionsInputSchema } from './ClientUpdateWithoutWorksheetSubmissionsInputSchema';
import { ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema } from './ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema';

export const ClientUpdateToOneWithWhereWithoutWorksheetSubmissionsInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutWorksheetSubmissionsInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutWorksheetSubmissionsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutWorksheetSubmissionsInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutWorksheetSubmissionsInputSchema;
