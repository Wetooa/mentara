import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { ModeratorUpdateWithoutUserInputSchema } from './ModeratorUpdateWithoutUserInputSchema';
import { ModeratorUncheckedUpdateWithoutUserInputSchema } from './ModeratorUncheckedUpdateWithoutUserInputSchema';

export const ModeratorUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ModeratorUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ModeratorWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ModeratorUpdateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ModeratorUpdateToOneWithWhereWithoutUserInputSchema;
