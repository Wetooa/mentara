import { z } from 'zod';

/////////////////////////////////////////
// CLIENT PREFERENCE SCHEMA
/////////////////////////////////////////

export const ClientPreferenceSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string(),
  key: z.string(),
  value: z.string(),
})

export type ClientPreference = z.infer<typeof ClientPreferenceSchema>

export default ClientPreferenceSchema;
