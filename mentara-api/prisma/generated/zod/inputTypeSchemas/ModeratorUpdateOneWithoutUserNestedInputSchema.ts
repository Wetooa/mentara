import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ModeratorCreateWithoutUserInputSchema } from './ModeratorCreateWithoutUserInputSchema';
import { ModeratorUncheckedCreateWithoutUserInputSchema } from './ModeratorUncheckedCreateWithoutUserInputSchema';
import { ModeratorCreateOrConnectWithoutUserInputSchema } from './ModeratorCreateOrConnectWithoutUserInputSchema';
import { ModeratorUpsertWithoutUserInputSchema } from './ModeratorUpsertWithoutUserInputSchema';
import { ModeratorWhereInputSchema } from './ModeratorWhereInputSchema';
import { ModeratorWhereUniqueInputSchema } from './ModeratorWhereUniqueInputSchema';
import { ModeratorUpdateToOneWithWhereWithoutUserInputSchema } from './ModeratorUpdateToOneWithWhereWithoutUserInputSchema';
import { ModeratorUpdateWithoutUserInputSchema } from './ModeratorUpdateWithoutUserInputSchema';
import { ModeratorUncheckedUpdateWithoutUserInputSchema } from './ModeratorUncheckedUpdateWithoutUserInputSchema';

export const ModeratorUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.ModeratorUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ModeratorCreateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ModeratorCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => ModeratorUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ModeratorWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ModeratorWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ModeratorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ModeratorUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => ModeratorUpdateWithoutUserInputSchema),z.lazy(() => ModeratorUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export default ModeratorUpdateOneWithoutUserNestedInputSchema;
