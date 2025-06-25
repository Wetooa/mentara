import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistUpdateWithoutClientInputSchema } from './ClientTherapistUpdateWithoutClientInputSchema';
import { ClientTherapistUncheckedUpdateWithoutClientInputSchema } from './ClientTherapistUncheckedUpdateWithoutClientInputSchema';
import { ClientTherapistCreateWithoutClientInputSchema } from './ClientTherapistCreateWithoutClientInputSchema';
import { ClientTherapistUncheckedCreateWithoutClientInputSchema } from './ClientTherapistUncheckedCreateWithoutClientInputSchema';

export const ClientTherapistUpsertWithWhereUniqueWithoutClientInputSchema: z.ZodType<Prisma.ClientTherapistUpsertWithWhereUniqueWithoutClientInput> = z.object({
  where: z.lazy(() => ClientTherapistWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ClientTherapistUpdateWithoutClientInputSchema),z.lazy(() => ClientTherapistUncheckedUpdateWithoutClientInputSchema) ]),
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutClientInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutClientInputSchema) ]),
}).strict();

export default ClientTherapistUpsertWithWhereUniqueWithoutClientInputSchema;
