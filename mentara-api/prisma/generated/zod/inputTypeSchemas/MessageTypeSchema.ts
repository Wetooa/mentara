import { z } from 'zod';

export const MessageTypeSchema = z.enum(['TEXT','IMAGE','FILE','VOICE','VIDEO','SYSTEM','LOCATION','POLL']);

export type MessageTypeType = `${z.infer<typeof MessageTypeSchema>}`

export default MessageTypeSchema;
