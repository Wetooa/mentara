import { z } from 'zod';

/////////////////////////////////////////
// CLIENT SCHEMA
/////////////////////////////////////////

export const ClientSchema = z.object({
  userId: z.string(),
  hasSeenTherapistRecommendations: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Client = z.infer<typeof ClientSchema>;

export default ClientSchema;
