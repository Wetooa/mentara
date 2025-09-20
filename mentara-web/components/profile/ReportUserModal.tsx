"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReportUser } from "@/hooks/profile/useProfile";
import { UserReportDto } from "@/lib/api/services/profile";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Flag } from "lucide-react";

// Form validation schema
const reportFormSchema = z.object({
  reason: z.enum(
    [
      "harassment",
      "inappropriate",
      "spam",
      "fake_profile",
      "impersonation",
      "other",
    ],
    {
      required_error: "Please select a reason for reporting",
    }
  ),
  content: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  user: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    role: string;
    createdAt: string;
  };
}

// Map reason codes to user-friendly labels
const reasonLabels: Record<UserReportDto["reason"], string> = {
  harassment: "Harassment or Bullying",
  inappropriate: "Inappropriate Content or Behavior",
  spam: "Spam or Unwanted Messages",
  fake_profile: "Fake or Misleading Profile",
  impersonation: "Impersonation of Another Person",
  other: "Other Violation",
};

export function ReportUserModal({
  isOpen,
  onClose,
  userId,
  user,
}: ReportUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reportUserMutation = useReportUser();

  console.log(
    "ReportUserModal rendered with userId:",
    userId,
    "userName:",
    user.firstName || user.middleName || user.lastName || "Unknown User"
  );

  const userName =
    user.firstName || user.middleName || user.lastName || "Unknown User";

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reason: undefined,
      content: "",
    },
  });

  const handleSubmit = async (data: ReportFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    console.log("Submitting report with data:", data, userId);
    try {
      await reportUserMutation.mutateAsync({
        userId,
        reportData: {
          reason: data.reason,
          content: data.content || undefined,
        },
      });

      // Close modal and reset form on success
      handleClose();
    } catch (error) {
      // Error handling is done in the mutation hook via toast
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission

    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Report User
          </DialogTitle>
          <DialogDescription>
            Report <strong>{userName}</strong> for violating community
            guidelines. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Reason Selection */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Reason for Report <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the reason that best describes the violation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Details */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Additional Details (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide additional context or specific examples of the violation..."
                      className="min-h-[100px] resize-none"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide specific examples or additional context. Maximum
                    1000 characters ({field.value?.length || 0}/1000)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  Important Notice
                </p>
                <p className="text-amber-700">
                  False reports may result in account restrictions. Please only
                  report genuine violations of our community guidelines.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? "Submitting Report..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ReportUserModal;
