import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientUpdateWithoutMeetingsInputSchema } from './ClientUpdateWithoutMeetingsInputSchema';
import { ClientUncheckedUpdateWithoutMeetingsInputSchema } from './ClientUncheckedUpdateWithoutMeetingsInputSchema';
import { ClientCreateWithoutMeetingsInputSchema } from './ClientCreateWithoutMeetingsInputSchema';
import { ClientUncheckedCreateWithoutMeetingsInputSchema } from './ClientUncheckedCreateWithoutMeetingsInputSchema';
import { ClientWhereInputSchema } from './ClientWhereInputSchema';

export const ClientUpsertWithoutMeetingsInputSchema: z.ZodType<Prisma.ClientUpsertWithoutMeetingsInput> = z.object({
  update: z.union([ z.lazy(() => ClientUpdateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutMeetingsInputSchema) ]),
  create: z.union([ z.lazy(() => ClientCreateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutMeetingsInputSchema) ]),
  where: z.lazy(() => ClientWhereInputSchema).optional()
}).strict();

export default ClientUpsertWithoutMeetingsInputSchema;
