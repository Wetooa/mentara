import { z } from 'zod';

export const GetScheduleDtoSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  includeCompleted: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type GetScheduleDto = z.infer<typeof GetScheduleDtoSchema>;
