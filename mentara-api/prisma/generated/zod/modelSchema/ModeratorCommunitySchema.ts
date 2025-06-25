import { z } from 'zod';

/////////////////////////////////////////
// MODERATOR COMMUNITY SCHEMA
/////////////////////////////////////////

export const ModeratorCommunitySchema = z.object({
  id: z.string().uuid(),
  moderatorId: z.string(),
  communityId: z.string(),
  assignedAt: z.coerce.date(),
})

export type ModeratorCommunity = z.infer<typeof ModeratorCommunitySchema>

export default ModeratorCommunitySchema;
