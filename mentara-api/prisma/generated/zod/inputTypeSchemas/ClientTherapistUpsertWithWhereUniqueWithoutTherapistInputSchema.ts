import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ClientTherapistWhereUniqueInputSchema } from './ClientTherapistWhereUniqueInputSchema';
import { ClientTherapistUpdateWithoutTherapistInputSchema } from './ClientTherapistUpdateWithoutTherapistInputSchema';
import { ClientTherapistUncheckedUpdateWithoutTherapistInputSchema } from './ClientTherapistUncheckedUpdateWithoutTherapistInputSchema';
import { ClientTherapistCreateWithoutTherapistInputSchema } from './ClientTherapistCreateWithoutTherapistInputSchema';
import { ClientTherapistUncheckedCreateWithoutTherapistInputSchema } from './ClientTherapistUncheckedCreateWithoutTherapistInputSchema';

export const ClientTherapistUpsertWithWhereUniqueWithoutTherapistInputSchema: z.ZodType<Prisma.ClientTherapistUpsertWithWhereUniqueWithoutTherapistInput> = z.object({
  where: z.lazy(() => ClientTherapistWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ClientTherapistUpdateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUncheckedUpdateWithoutTherapistInputSchema) ]),
  create: z.union([ z.lazy(() => ClientTherapistCreateWithoutTherapistInputSchema),z.lazy(() => ClientTherapistUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default ClientTherapistUpsertWithWhereUniqueWithoutTherapistInputSchema;
