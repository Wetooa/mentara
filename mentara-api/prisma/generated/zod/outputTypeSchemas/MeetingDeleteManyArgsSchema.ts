import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingWhereInputSchema } from '../inputTypeSchemas/MeetingWhereInputSchema'

export const MeetingDeleteManyArgsSchema: z.ZodType<Prisma.MeetingDeleteManyArgs> = z.object({
  where: MeetingWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingDeleteManyArgsSchema;
