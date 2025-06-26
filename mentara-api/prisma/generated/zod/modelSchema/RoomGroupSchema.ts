import { z } from 'zod';

/////////////////////////////////////////
// ROOM GROUP SCHEMA
/////////////////////////////////////////

export const RoomGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  order: z.number().int(),
  communityId: z.string(),
})

export type RoomGroup = z.infer<typeof RoomGroupSchema>

export default RoomGroupSchema;
