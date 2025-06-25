import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupUpdateManyMutationInputSchema } from '../inputTypeSchemas/RoomGroupUpdateManyMutationInputSchema'
import { RoomGroupUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RoomGroupUncheckedUpdateManyInputSchema'
import { RoomGroupWhereInputSchema } from '../inputTypeSchemas/RoomGroupWhereInputSchema'

export const RoomGroupUpdateManyArgsSchema: z.ZodType<Prisma.RoomGroupUpdateManyArgs> = z.object({
  data: z.union([ RoomGroupUpdateManyMutationInputSchema,RoomGroupUncheckedUpdateManyInputSchema ]),
  where: RoomGroupWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default RoomGroupUpdateManyArgsSchema;
