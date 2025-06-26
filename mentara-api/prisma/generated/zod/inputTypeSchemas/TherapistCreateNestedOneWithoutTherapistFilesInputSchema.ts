import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutTherapistFilesInputSchema } from './TherapistCreateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistFilesInputSchema } from './TherapistUncheckedCreateWithoutTherapistFilesInputSchema';
import { TherapistCreateOrConnectWithoutTherapistFilesInputSchema } from './TherapistCreateOrConnectWithoutTherapistFilesInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';

export const TherapistCreateNestedOneWithoutTherapistFilesInputSchema: z.ZodType<Prisma.TherapistCreateNestedOneWithoutTherapistFilesInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutTherapistFilesInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional()
}).strict();

export default TherapistCreateNestedOneWithoutTherapistFilesInputSchema;
