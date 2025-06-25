import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupCreateManyInputSchema } from '../inputTypeSchemas/RoomGroupCreateManyInputSchema'

export const RoomGroupCreateManyArgsSchema: z.ZodType<Prisma.RoomGroupCreateManyArgs> = z.object({
  data: z.union([ RoomGroupCreateManyInputSchema,RoomGroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RoomGroupCreateManyArgsSchema;
