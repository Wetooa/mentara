import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetCreateWithoutTherapistInputSchema } from './WorksheetCreateWithoutTherapistInputSchema';
import { WorksheetUncheckedCreateWithoutTherapistInputSchema } from './WorksheetUncheckedCreateWithoutTherapistInputSchema';
import { WorksheetCreateOrConnectWithoutTherapistInputSchema } from './WorksheetCreateOrConnectWithoutTherapistInputSchema';
import { WorksheetCreateManyTherapistInputEnvelopeSchema } from './WorksheetCreateManyTherapistInputEnvelopeSchema';
import { WorksheetWhereUniqueInputSchema } from './WorksheetWhereUniqueInputSchema';

export const WorksheetUncheckedCreateNestedManyWithoutTherapistInputSchema: z.ZodType<Prisma.WorksheetUncheckedCreateNestedManyWithoutTherapistInput> = z.object({
  create: z.union([ z.lazy(() => WorksheetCreateWithoutTherapistInputSchema),z.lazy(() => WorksheetCreateWithoutTherapistInputSchema).array(),z.lazy(() => WorksheetUncheckedCreateWithoutTherapistInputSchema),z.lazy(() => WorksheetUncheckedCreateWithoutTherapistInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => WorksheetCreateOrConnectWithoutTherapistInputSchema),z.lazy(() => WorksheetCreateOrConnectWithoutTherapistInputSchema).array() ]).optional(),
  createMany: z.lazy(() => WorksheetCreateManyTherapistInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => WorksheetWhereUniqueInputSchema),z.lazy(() => WorksheetWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default WorksheetUncheckedCreateNestedManyWithoutTherapistInputSchema;
