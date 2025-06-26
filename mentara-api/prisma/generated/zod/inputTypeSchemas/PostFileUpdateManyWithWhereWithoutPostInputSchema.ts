import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileScalarWhereInputSchema } from './PostFileScalarWhereInputSchema';
import { PostFileUpdateManyMutationInputSchema } from './PostFileUpdateManyMutationInputSchema';
import { PostFileUncheckedUpdateManyWithoutPostInputSchema } from './PostFileUncheckedUpdateManyWithoutPostInputSchema';

export const PostFileUpdateManyWithWhereWithoutPostInputSchema: z.ZodType<Prisma.PostFileUpdateManyWithWhereWithoutPostInput> = z.object({
  where: z.lazy(() => PostFileScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PostFileUpdateManyMutationInputSchema),z.lazy(() => PostFileUncheckedUpdateManyWithoutPostInputSchema) ]),
}).strict();

export default PostFileUpdateManyWithWhereWithoutPostInputSchema;
