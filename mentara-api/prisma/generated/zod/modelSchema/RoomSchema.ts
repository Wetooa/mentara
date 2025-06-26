import { z } from 'zod';

/////////////////////////////////////////
// ROOM SCHEMA
/////////////////////////////////////////

export const RoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  order: z.number().int(),
  roomGroupId: z.string(),
})

export type Room = z.infer<typeof RoomSchema>

export default RoomSchema;
