import { z } from 'zod';

export const RespondToInvitationDtoSchema = z.object({
  action: z.enum(['ACCEPTED', 'DECLINED']),
  message: z.string().max(500).optional(),
});

export type RespondToInvitationDto = z.infer<
  typeof RespondToInvitationDtoSchema
>;
