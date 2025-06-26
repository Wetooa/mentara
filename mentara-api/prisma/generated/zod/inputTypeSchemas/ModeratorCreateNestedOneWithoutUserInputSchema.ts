import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreateWithoutUserInputSchema } from './ModeratorCreateWithoutUserInputSchema';
import { ModeratorUncheckedCreateWithoutUserInputSchema } from './ModeratorUncheckedCreateWithoutUserInputSchema';
import { ModeratorCreateOrConnectWithoutUserInputSchema } from './ModeratorCreateOrConnectWithoutUserInputSchema';
import { ModeratorWhereUniqueInputSchema } from './ModeratorWhereUniqueInputSchema';

export const ModeratorCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.ModeratorCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCreateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ModeratorCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => ModeratorWhereUniqueInputSchema).optional()
}).strict();

export default ModeratorCreateNestedOneWithoutUserInputSchema;
