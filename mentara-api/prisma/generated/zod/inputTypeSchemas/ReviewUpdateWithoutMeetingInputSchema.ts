import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { ReviewStatusSchema } from './ReviewStatusSchema';
import { EnumReviewStatusFieldUpdateOperationsInputSchema } from './EnumReviewStatusFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ClientUpdateOneRequiredWithoutReviewsNestedInputSchema } from './ClientUpdateOneRequiredWithoutReviewsNestedInputSchema';
import { TherapistUpdateOneRequiredWithoutReviewsNestedInputSchema } from './TherapistUpdateOneRequiredWithoutReviewsNestedInputSchema';
import { ReviewHelpfulUpdateManyWithoutReviewNestedInputSchema } from './ReviewHelpfulUpdateManyWithoutReviewNestedInputSchema';

export const ReviewUpdateWithoutMeetingInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutMeetingInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isAnonymous: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ReviewStatusSchema),z.lazy(() => EnumReviewStatusFieldUpdateOperationsInputSchema) ]).optional(),
  moderatedBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  moderatedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  moderationNote: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  helpfulCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  client: z.lazy(() => ClientUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  therapist: z.lazy(() => TherapistUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  helpfulVotes: z.lazy(() => ReviewHelpfulUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export default ReviewUpdateWithoutMeetingInputSchema;
