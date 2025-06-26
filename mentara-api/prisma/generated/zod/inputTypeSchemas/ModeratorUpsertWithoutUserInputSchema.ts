import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorUpdateWithoutUserInputSchema } from './ModeratorUpdateWithoutUserInputSchema';
import { ModeratorUncheckedUpdateWithoutUserInputSchema } from './ModeratorUncheckedUpdateWithoutUserInputSchema';
import { ModeratorCreateWithoutUserInputSchema } from './ModeratorCreateWithoutUserInputSchema';
import { ModeratorUncheckedCreateWithoutUserInputSchema } from './ModeratorUncheckedCreateWithoutUserInputSchema';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';

export const ModeratorUpsertWithoutUserInputSchema: z.ZodType<Prisma.ModeratorUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => ModeratorUpdateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ModeratorCreateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => ModeratorWhereInputSchema).optional()
}).strict();

export default ModeratorUpsertWithoutUserInputSchema;
