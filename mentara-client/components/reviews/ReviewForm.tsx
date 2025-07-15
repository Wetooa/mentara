"use client";

import * as React from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, EyeOff } from "lucide-react";
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

export default function ReviewForm({
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
        <button
          key={starValue}
          type="button"
          className={`text-2xl transition-colors ${
            interactive ? "hover:scale-110" : ""
          } ${
            isFilled ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => interactive && form.setValue("rating", starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          disabled={!interactive}
        >
          <Star className={`h-6 w-6 ${isFilled ? "fill-yellow-400" : ""}`} />
        </button>
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Review Dr. {therapist.name}
          </DialogTitle>
          <DialogDescription>
            Share your experience to help other patients find the right therapist.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Section */}
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
                      {(hoveredRating || selectedRating) > 0 && (
                        <p className="text-sm text-gray-600">
                          {getRatingText(hoveredRating || selectedRating)}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: ControllerRenderProps<ReviewFormData, "title"> }) => (
                <FormItem>
                  <FormLabel>Review Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summarize your experience in a few words"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }: { field: ControllerRenderProps<ReviewFormData, "content"> }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell others about your experience with this therapist. What did you like? How did they help you?"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Minimum 10 characters</span>
                    <span>{field.value?.length || 0}/1000</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anonymous Option */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }: { field: ControllerRenderProps<ReviewFormData, "isAnonymous"> }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2 cursor-pointer">
                      <EyeOff className="h-4 w-4" />
                      Post anonymously
                    </FormLabel>
                    <p className="text-sm text-gray-500">
                      Your name will not be displayed with this review
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createReviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createReviewMutation.isPending || !form.formState.isValid}
                className="min-w-[100px]"
              >
                {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}