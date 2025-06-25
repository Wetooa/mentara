import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { TherapistCreateWithoutWorksheetsInputSchema } from './TherapistCreateWithoutWorksheetsInputSchema';
import { TherapistUncheckedCreateWithoutWorksheetsInputSchema } from './TherapistUncheckedCreateWithoutWorksheetsInputSchema';
import { TherapistCreateOrConnectWithoutWorksheetsInputSchema } from './TherapistCreateOrConnectWithoutWorksheetsInputSchema';
import { TherapistUpsertWithoutWorksheetsInputSchema } from './TherapistUpsertWithoutWorksheetsInputSchema';
import { TherapistWhereInputSchema } from './TherapistWhereInputSchema';
import { TherapistWhereUniqueInputSchema } from './TherapistWhereUniqueInputSchema';
import { TherapistUpdateToOneWithWhereWithoutWorksheetsInputSchema } from './TherapistUpdateToOneWithWhereWithoutWorksheetsInputSchema';
import { TherapistUpdateWithoutWorksheetsInputSchema } from './TherapistUpdateWithoutWorksheetsInputSchema';
import { TherapistUncheckedUpdateWithoutWorksheetsInputSchema } from './TherapistUncheckedUpdateWithoutWorksheetsInputSchema';

export const TherapistUpdateOneWithoutWorksheetsNestedInputSchema: z.ZodType<Prisma.TherapistUpdateOneWithoutWorksheetsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TherapistCreateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedCreateWithoutWorksheetsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TherapistCreateOrConnectWithoutWorksheetsInputSchema).optional(),
  upsert: z.lazy(() => TherapistUpsertWithoutWorksheetsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => TherapistWhereInputSchema) ]).optional(),
  connect: z.lazy(() => TherapistWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TherapistUpdateToOneWithWhereWithoutWorksheetsInputSchema),z.lazy(() => TherapistUpdateWithoutWorksheetsInputSchema),z.lazy(() => TherapistUncheckedUpdateWithoutWorksheetsInputSchema) ]).optional(),
}).strict();

export default TherapistUpdateOneWithoutWorksheetsNestedInputSchema;
