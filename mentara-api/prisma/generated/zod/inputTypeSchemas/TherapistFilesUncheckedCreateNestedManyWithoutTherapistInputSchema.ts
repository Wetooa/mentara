import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistFilesCreateWithoutTherapistInputSchema } from './TherapistFilesCreateWithoutTherapistInputSchema';
import { TherapistFilesUncheckedCreateWithoutTherapistInputSchema } from './TherapistFilesUncheckedCreateWithoutTherapistInputSchema';
import { TherapistFilesCreateOrConnectWithoutTherapistInputSchema } from './TherapistFilesCreateOrConnectWithoutTherapistInputSchema';
import { TherapistFilesCreateManyTherapistInputEnvelopeSchema } from './TherapistFilesCreateManyTherapistInputEnvelopeSchema';
import { TherapistFilesWhereUniqueInputSchema } from './TherapistFilesWhereUniqueInputSchema';

export const TherapistFilesUncheckedCreateNestedManyWithoutTherapistInputSchema: z.ZodType<Prisma.TherapistFilesUncheckedCreateNestedManyWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => TherapistFilesCreateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesCreateWithoutTherapistInputSchema).array(),z.lazy(() => TherapistFilesUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => TherapistFilesUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TherapistFilesCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => TherapistFilesCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TherapistFilesCreateManyTherapistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TherapistFilesWhereUniqueInputSchema),z.lazy(() => TherapistFilesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TherapistFilesUncheckedCreateNestedManyWithoutTherapistInputSchema;
