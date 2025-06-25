import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomCreateManyInputSchema } from '../inputTypeSchemas/RoomCreateManyInputSchema'

export const RoomCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RoomCreateManyAndReturnArgs> = z.object({
  data: z.union([ RoomCreateManyInputSchema,RoomCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RoomCreateManyAndReturnArgsSchema;
