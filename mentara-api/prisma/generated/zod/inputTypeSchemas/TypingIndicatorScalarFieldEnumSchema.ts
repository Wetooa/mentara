import { z } from 'zod';

export const TypingIndicatorScalarFieldEnumSchema = z.enum(['id','conversationId','userId','isTyping','lastTypingAt']);

export default TypingIndicatorScalarFieldEnumSchema;
