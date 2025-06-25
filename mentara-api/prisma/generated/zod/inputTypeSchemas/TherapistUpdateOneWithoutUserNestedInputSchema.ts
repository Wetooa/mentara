import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutUserInputSchema } from './TherapistCreateWithoutUserInputSchema';
import { TherapistUncheckedCreateWithoutUserInputSchema } from './TherapistUncheckedCreateWithoutUserInputSchema';
import { TherapistCreateOrConnectWithoutUserInputSchema } from './TherapistCreateOrConnectWithoutUserInputSchema';
import { TherapistUpsertWithoutUserInputSchema } from './TherapistUpsertWithoutUserInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutUserInputSchema } from './TherapistUpdateToOneWithWhereWithoutUserInputSchema';
import { TherapistUpdateWithoutUserInputSchema } from './TherapistUpdateWithoutUserInputSchema';
import { TherapistUncheckedUpdateWithoutUserInputSchema } from './TherapistUncheckedUpdateWithoutUserInputSchema';

export const TherapistUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => TherapistUpdateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneWithoutUserNestedInputSchema;
