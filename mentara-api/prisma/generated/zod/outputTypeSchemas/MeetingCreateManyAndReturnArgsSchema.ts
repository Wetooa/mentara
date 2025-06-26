import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingCreateManyInputSchema } from '../inputTypeSchemas/MeetingCreateManyInputSchema'

export const MeetingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MeetingCreateManyAndReturnArgs> = z.object({
  data: z.union([ MeetingCreateManyInputSchema,MeetingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MeetingCreateManyAndReturnArgsSchema;
