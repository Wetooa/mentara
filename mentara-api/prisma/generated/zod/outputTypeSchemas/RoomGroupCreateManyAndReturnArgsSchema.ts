import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RoomGroupCreateManyInputSchema } from '../inputTypeSchemas/RoomGroupCreateManyInputSchema'

export const RoomGroupCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RoomGroupCreateManyAndReturnArgs> = z.object({
  data: z.union([ RoomGroupCreateManyInputSchema,RoomGroupCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RoomGroupCreateManyAndReturnArgsSchema;
