import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutUserInputSchema } from './TherapistCreateWithoutUserInputSchema';
import { TherapistUncheckedCreateWithoutUserInputSchema } from './TherapistUncheckedCreateWithoutUserInputSchema';
import { TherapistCreateOrConnectWithoutUserInputSchema } from './TherapistCreateOrConnectWithoutUserInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.TherapistUncheckedCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutUserInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistUncheckedCreateNestedOneWithoutUserInputSchema;
