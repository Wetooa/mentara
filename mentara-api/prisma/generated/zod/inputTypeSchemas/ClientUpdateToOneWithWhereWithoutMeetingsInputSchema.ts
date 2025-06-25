import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';
import { ClientUpdateWithoutMeetingsInputSchema } from './ClientUpdateWithoutMeetingsInputSchema';
import { ClientUncheckedUpdateWithoutMeetingsInputSchema } from './ClientUncheckedUpdateWithoutMeetingsInputSchema';

export const ClientUpdateToOneWithWhereWithoutMeetingsInputSchema: z.ZodType<Prisma.ClientUpdateToOneWithWhereWithoutMeetingsInput> = z.object({
  where: z.lazy(() => ClientWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ClientUpdateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutMeetingsInputSchema) ]),
}).strict();

export default ClientUpdateToOneWithWhereWithoutMeetingsInputSchema;
