import { z } from 'zod';

export const ParticipantRoleSchema = z.enum(['MEMBER','MODERATOR','ADMIN']);

export type ParticipantRoleType = `${z.infer<typeof ParticipantRoleSchema>}`

export default ParticipantRoleSchema;
