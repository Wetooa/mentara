import { z } from 'zod';
import { UserSchema } from 'prisma/generated/zod/modelSchema';

export type UserResponse = z.infer<typeof UserSchema>;
