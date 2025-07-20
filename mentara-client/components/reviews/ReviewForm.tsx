"use client";

import * as React from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateReview } from "@/hooks/useReviews";
import { TherapistCardData } from "@/types/therapist";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters"),
  isAnonymous: z.boolean().default(false),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  therapist: TherapistCardData | null;
  meetingId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const starVariants = {
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 1.1,
    transition: { duration: 0.1 }
  }
};

const submitButtonVariants = {
  idle: { scale: 1 },
  loading: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
};

export function ReviewForm({
  therapist,
  meetingId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const createReviewMutation = useCreateReview();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      content: "",
      isAnonymous: false,
    },
  });

  const selectedRating = form.watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    if (!therapist) return;

    await createReviewMutation.mutateAsync({
      ...data,
      therapistId: therapist.id,
      meetingId,
    });

    form.reset();
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const renderStars = (interactive = true) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (interactive ? (hoveredRating || selectedRating) : selectedRating);
      
      return (
        <motion.button
          key={starValue}
          type="button"
          className={`text-2xl transition-colors ${
            isFilled ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => interactive && form.setValue("rating", starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          disabled={!interactive}
          variants={starVariants}
          whileHover={interactive ? "hover" : undefined}
          whileTap={interactive ? "tap" : undefined}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            transition: { 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300
            }
          }}
        >
          <Star className={`h-6 w-6 ${isFilled ? "fill-yellow-400" : ""}`} />
        </motion.button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return texts[rating as keyof typeof texts] || "";
  };

  if (!therapist) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[500px]">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={itemVariants}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    >
                      <Star className="h-5 w-5 text-yellow-400" />
                    </motion.div>
                    Review Dr. {therapist.name}
                  </DialogTitle>
                  <DialogDescription>
                    Share your experience to help other patients find the right therapist.
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Rating Section */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="rating"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">How would you rate your experience?</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                {renderStars()}
                              </div>
                              <AnimatePresence>
                                {(hoveredRating || selectedRating) > 0 && (
                                  <motion.p 
                                    className="text-sm text-gray-600"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {getRatingText(hoveredRating || selectedRating)}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Title Field */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }: { field: ControllerRenderProps<ReviewFormData, "title"> }) => (
                        <FormItem>
                          <FormLabel>Review Title</FormLabel>
                          <FormControl>
                            <motion.div
                              whileFocus={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                placeholder="Summarize your experience in a few words"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Content Field */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }: { field: ControllerRenderProps<ReviewFormData, "content"> }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <motion.div
                              whileFocus={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Textarea
                                placeholder="Tell others about your experience with this therapist. What did you like? How did they help you?"
                                className="min-h-[120px] resize-none"
                                {...field}
                              />
                            </motion.div>
                          </FormControl>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Minimum 10 characters</span>
                            <motion.span
                              key={field.value?.length || 0}
                              initial={{ scale: 1.2, color: "#3b82f6" }}
                              animate={{ scale: 1, color: "#6b7280" }}
                              transition={{ duration: 0.3 }}
                            >
                              {field.value?.length || 0}/1000
                            </motion.span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Anonymous Option */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }: { field: ControllerRenderProps<ReviewFormData, "isAnonymous"> }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </motion.div>
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <motion.div
                                animate={{ rotate: field.value ? 360 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <EyeOff className="h-4 w-4" />
                              </motion.div>
                              Post anonymously
                            </FormLabel>
                            <p className="text-sm text-gray-500">
                              Your name will not be displayed with this review
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <DialogFooter>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={createReviewMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div
                        variants={submitButtonVariants}
                        animate={createReviewMutation.isPending ? "loading" : "idle"}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          disabled={createReviewMutation.isPending || !form.formState.isValid}
                          className="min-w-[100px]"
                        >
                          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                      </motion.div>
                    </DialogFooter>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}