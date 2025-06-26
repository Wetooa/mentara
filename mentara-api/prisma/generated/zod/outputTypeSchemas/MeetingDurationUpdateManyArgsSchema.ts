import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationUpdateManyMutationInputSchema } from '../inputTypeSchemas/MeetingDurationUpdateManyMutationInputSchema'
import { MeetingDurationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MeetingDurationUncheckedUpdateManyInputSchema'
import { MeetingDurationWhereInputSchema } from '../inputTypeSchemas/MeetingDurationWhereInputSchema'

export const MeetingDurationUpdateManyArgsSchema: z.ZodType<Prisma.MeetingDurationUpdateManyArgs> = z.object({
  data: z.union([ MeetingDurationUpdateManyMutationInputSchema,MeetingDurationUncheckedUpdateManyInputSchema ]),
  where: MeetingDurationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingDurationUpdateManyArgsSchema;
