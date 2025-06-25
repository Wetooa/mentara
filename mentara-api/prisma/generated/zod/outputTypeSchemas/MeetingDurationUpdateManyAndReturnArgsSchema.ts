import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationUpdateManyMutationInputSchema } from '../inputTypeSchemas/MeetingDurationUpdateManyMutationInputSchema'
import { MeetingDurationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MeetingDurationUncheckedUpdateManyInputSchema'
import { MeetingDurationWhereInputSchema } from '../inputTypeSchemas/MeetingDurationWhereInputSchema'

export const MeetingDurationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.MeetingDurationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ MeetingDurationUpdateManyMutationInputSchema,MeetingDurationUncheckedUpdateManyInputSchema ]),
  where: MeetingDurationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingDurationUpdateManyAndReturnArgsSchema;
