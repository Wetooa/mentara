import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialCreateManyWorksheetInputSchema } from './WorksheetMaterialCreateManyWorksheetInputSchema';

export const WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema: z.ZodType<Prisma.WorksheetMaterialCreateManyWorksheetInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => WorksheetMaterialCreateManyWorksheetInputSchema),z.lazy(() => WorksheetMaterialCreateManyWorksheetInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default WorksheetMaterialCreateManyWorksheetInputEnvelopeSchema;
