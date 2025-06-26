import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorWhereUniqueInputSchema } from './ModeratorWhereUniqueInputSchema';
import { ModeratorCreateWithoutUserInputSchema } from './ModeratorCreateWithoutUserInputSchema';
import { ModeratorUncheckedCreateWithoutUserInputSchema } from './ModeratorUncheckedCreateWithoutUserInputSchema';

export const ModeratorCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ModeratorCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ModeratorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ModeratorCreateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ModeratorCreateOrConnectWithoutUserInputSchema;
