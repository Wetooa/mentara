import { z } from 'zod';

export const CreateGroupSessionDtoSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  communityId: z.string().cuid(),
  sessionType: z.enum(['VIRTUAL', 'IN_PERSON']),
  scheduledAt: z.coerce.date(),
  duration: z.number().min(15).max(180), // 15 minutes to 3 hours
  maxParticipants: z.number().min(2).max(50),
  virtualLink: z.string().url().optional(),
  location: z.string().max(200).optional(),
  locationAddress: z.string().max(500).optional(),
  therapistIds: z.array(z.string().cuid()).min(1).max(10),
});

export type CreateGroupSessionDto = z.infer<typeof CreateGroupSessionDtoSchema>;
