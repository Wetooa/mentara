import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationCreateManyInputSchema } from '../inputTypeSchemas/MeetingDurationCreateManyInputSchema'

export const MeetingDurationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MeetingDurationCreateManyAndReturnArgs> = z.object({
  data: z.union([ MeetingDurationCreateManyInputSchema,MeetingDurationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MeetingDurationCreateManyAndReturnArgsSchema;
