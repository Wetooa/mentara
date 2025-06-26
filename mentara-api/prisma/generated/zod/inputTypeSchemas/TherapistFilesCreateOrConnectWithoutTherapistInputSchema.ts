import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesWhereUniqueInputSchema } from './TherapistFilesWhereUniqueInputSchema';
import { TherapistFilesCreateWithoutTherapistInputSchema } from './TherapistFilesCreateWithoutTherapistInputSchema';
import { TherapistFilesUncheckedCreateWithoutTherapistInputSchema } from './TherapistFilesUncheckedCreateWithoutTherapistInputSchema';

export const TherapistFilesCreateOrConnectWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesCreateOrConnectWithoutTherapistInput> = z.object({
  where: z.lazy(() => TherapistFilesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistFilesCreateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUncheckedCreateWithoutTherapistInputSchema) ]),
}).strict();

export default TherapistFilesCreateOrConnectWithoutTherapistInputSchema;
