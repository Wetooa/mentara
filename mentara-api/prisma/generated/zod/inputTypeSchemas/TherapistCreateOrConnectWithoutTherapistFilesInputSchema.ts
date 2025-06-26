import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistCreateWithoutTherapistFilesInputSchema } from './TherapistCreateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistFilesInputSchema } from './TherapistUncheckedCreateWithoutTherapistFilesInputSchema';

export const TherapistCreateOrConnectWithoutTherapistFilesInputSchema: z.ZodType<Prisma.TherapistCreateOrConnectWithoutTherapistFilesInput> = z.object({
  where: z.lazy(() => TherapistWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistFilesInputSchema) ]),
}).strict();

export default TherapistCreateOrConnectWithoutTherapistFilesInputSchema;
