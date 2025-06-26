import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutTherapistFilesInputSchema } from './TherapistCreateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedCreateWithoutTherapistFilesInputSchema } from './TherapistUncheckedCreateWithoutTherapistFilesInputSchema';
import { TherapistCreateOrConnectWithoutTherapistFilesInputSchema } from './TherapistCreateOrConnectWithoutTherapistFilesInputSchema';
import { TherapistUpsertWithoutTherapistFilesInputSchema } from './TherapistUpsertWithoutTherapistFilesInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutTherapistFilesInputSchema } from './TherapistUpdateToOneWithWhereWithoutTherapistFilesInputSchema';
import { TherapistUpdateWithoutTherapistFilesInputSchema } from './TherapistUpdateWithoutTherapistFilesInputSchema';
import { TherapistUncheckedUpdateWithoutTherapistFilesInputSchema } from './TherapistUncheckedUpdateWithoutTherapistFilesInputSchema';

export const TherapistUpdateOneRequiredWithoutTherapistFilesNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneRequiredWithoutTherapistFilesNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutTherapistFilesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutTherapistFilesInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutTherapistFilesInputSchema).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUpdateWithoutTherapistFilesInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutTherapistFilesInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneRequiredWithoutTherapistFilesNestedInputSchema;
