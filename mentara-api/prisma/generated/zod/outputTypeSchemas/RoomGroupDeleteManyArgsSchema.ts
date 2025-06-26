import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupWhereInputSchema } from '../inputTypeSchemas/RoomGroupWhereInputSchema'

export const RoomGroupDeleteManyArgsSchema: z.ZodType<Prisma.RoomGroupDeleteManyArgs> = z.object({
  where: RoomGroupWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default RoomGroupDeleteManyArgsSchema;
