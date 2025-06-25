import { z } from 'zod';
import {
  ClientCreateInputSchema,
  TherapistCreateInputSchema,
} from 'prisma/generated/zod/inputTypeSchemas';

export type ClientCreateDto = z.infer<typeof ClientCreateInputSchema>;
export type TherapistCreateDto = z.infer<typeof TherapistCreateInputSchema>;
