import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { WorksheetMaterialScalarWhereInputSchema } from './WorksheetMaterialScalarWhereInputSchema';
import { WorksheetMaterialUpdateManyMutationInputSchema } from './WorksheetMaterialUpdateManyMutationInputSchema';
import { WorksheetMaterialUncheckedUpdateManyWithoutWorksheetInputSchema } from './WorksheetMaterialUncheckedUpdateManyWithoutWorksheetInputSchema';

export const WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInputSchema: z.ZodType<Prisma.WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInput> = z.object({
  where: z.lazy(() => WorksheetMaterialScalarWhereInputSchema),
  data: z.union([ z.lazy(() => WorksheetMaterialUpdateManyMutationInputSchema),z.lazy(() => WorksheetMaterialUncheckedUpdateManyWithoutWorksheetInputSchema) ]),
}).strict();

export default WorksheetMaterialUpdateManyWithWhereWithoutWorksheetInputSchema;
