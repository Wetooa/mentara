import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientCreateWithoutMeetingsInputSchema } from './ClientCreateWithoutMeetingsInputSchema';
import { ClientUncheckedCreateWithoutMeetingsInputSchema } from './ClientUncheckedCreateWithoutMeetingsInputSchema';
import { ClientCreateOrConnectWithoutMeetingsInputSchema } from './ClientCreateOrConnectWithoutMeetingsInputSchema';
import { ClientUpsertWithoutMeetingsInputSchema } from './ClientUpsertWithoutMeetingsInputSchema';
import { ClientWhereUniqueInputSchema } from './ClientWhereUniqueInputSchema';
import { ClientUpdateToOneWithWhereWithoutMeetingsInputSchema } from './ClientUpdateToOneWithWhereWithoutMeetingsInputSchema';
import { ClientUpdateWithoutMeetingsInputSchema } from './ClientUpdateWithoutMeetingsInputSchema';
import { ClientUncheckedUpdateWithoutMeetingsInputSchema } from './ClientUncheckedUpdateWithoutMeetingsInputSchema';

export const ClientUpdateOneRequiredWithoutMeetingsNestedInputSchema: z.ZodType<Prisma.ClientUpdateOneRequiredWithoutMeetingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ClientCreateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedCreateWithoutMeetingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ClientCreateOrConnectWithoutMeetingsInputSchema).optional(),
  upsert: z.lazy(() => ClientUpsertWithoutMeetingsInputSchema).optional(),
  connect: z.lazy(() => ClientWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ClientUpdateToOneWithWhereWithoutMeetingsInputSchema),z.lazy(() => ClientUpdateWithoutMeetingsInputSchema),z.lazy(() => ClientUncheckedUpdateWithoutMeetingsInputSchema) ]).optional(),
}).strict();

export default ClientUpdateOneRequiredWithoutMeetingsNestedInputSchema;
