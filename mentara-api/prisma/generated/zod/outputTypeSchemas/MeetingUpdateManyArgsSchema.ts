import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingUpdateManyMutationInputSchema } from '../inputTypeSchemas/MeetingUpdateManyMutationInputSchema'
import { MeetingUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MeetingUncheckedUpdateManyInputSchema'
import { MeetingWhereInputSchema } from '../inputTypeSchemas/MeetingWhereInputSchema'

export const MeetingUpdateManyArgsSchema: z.ZodType<Prisma.MeetingUpdateManyArgs> = z.object({
  data: z.union([ MeetingUpdateManyMutationInputSchema,MeetingUncheckedUpdateManyInputSchema ]),
  where: MeetingWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingUpdateManyArgsSchema;
