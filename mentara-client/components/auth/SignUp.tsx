"use client";

import { PreAssessmentPageFormProps } from "@/app/(public)/(user)/pre-assessment/page";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RegisterClientDtoSchema, z } from "mentara-commons";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ContinueWithGoogle from "@/components/auth/ContinueWithGoogle";
import ContinueWithMicrosoft from "@/components/auth/ContinueWithMicrosoft";
import {
  usePreAssessmentChecklistStore,
  useSignUpStore,
} from "@/store/pre-assessment";
import { answersToAnswerMatrix } from "@/lib/questionnaire";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";

// Frontend-specific form schema that extends commons schema with confirmation fields
const formSchema = RegisterClientDtoSchema.extend({
  confirmEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails do not match",
    path: ["confirmEmail"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof formSchema>;

function PreAssessmentSignUp({
  handleNextButtonOnClick,
}: PreAssessmentPageFormProps) {
  const { questionnaires, answers } = usePreAssessmentChecklistStore();
  const { setDetails } = useSignUpStore();
  const { signUpWithEmail, signUpWithOAuth, isLoading } = useAuth();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "", // Using firstName instead of nickname to match commons schema
      lastName: "",
      middleName: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      birthDate: undefined,
      address: "",
    },
    mode: "onChange",
  });

  function storeAssessmentAnswersInLocalStorage() {
    const answersList = answersToAnswerMatrix(questionnaires, answers);
    localStorage.setItem("assessmentAnswers", JSON.stringify(answersList));
  }

  async function onSubmit(values: SignUpFormData) {
    storeAssessmentAnswersInLocalStorage();
    setDetails({
      nickName: values.firstName + (values.lastName ? ` ${values.lastName}` : ''),
      email: values.email,
    });

    try {
      // Prepare pre-assessment data
      const answersList = answersToAnswerMatrix(questionnaires, answers);

      // Transform form data to match commons RegisterClientDto
      const registrationData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || undefined,
        birthDate: values.birthDate || undefined,
        address: values.address || undefined,
        // Optional fields that could be added later
        avatarUrl: undefined,
        hasSeenTherapistRecommendations: false,
      };

      // Use centralized authentication with complete registration data
      const result = await signUpWithEmail(registrationData, {
        preAssessmentAnswers: answersList,
        source: "preAssessment",
        sendEmailVerification: true,
      });

      if (result?.success) {
        if (result.needsVerification) {
          toast.success("Verification email sent! Please check your inbox.");
          handleNextButtonOnClick();
        } else {
          toast.success("Account created successfully!");
          // Redirect will be handled by the useAuth hook
        }
      }
    } catch (error: unknown) {
      toast.error(`Failed to create account. ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
            <div className="mb-8 text-center">
              <p className="text-lg text-center text-secondary">
                You&apos;ve completed the pre-assessment!
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Firstname (or nickname)" {...field} />
                    </FormControl>
                    <FormDescription className="text-[10px] text-center">
                      For added privacy you can provide nickname instead of your
                      first name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Middle name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Birth date (optional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Address (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Confirm Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center items-center gap-2">
              <Separator className="flex-1" />
              <p className="px-2 text-black/60 text-xs">or</p>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-3">
              <div
                onClick={() => {
                  storeAssessmentAnswersInLocalStorage();
                  signUpWithOAuth("oauth_google", {
                    hasPreAssessmentData: true,
                    redirectPath: "/user/welcome",
                  });
                }}
              >
                <ContinueWithGoogle />
              </div>

              <div
                onClick={() => {
                  storeAssessmentAnswersInLocalStorage();
                  signUpWithOAuth("oauth_microsoft", {
                    hasPreAssessmentData: true,
                    redirectPath: "/user/welcome",
                  });
                }}
              >
                <ContinueWithMicrosoft />
              </div>

              {/* FIX: Implement this */}
              {/* <GoogleOneTap /> */}
            </div>

            {/* CAPTCHA Widget */}
            <div
              className="w-full flex justify-center"
              id="clerk-captcha"
            ></div>
          </div>

          <div className="bg-white px-10 py-3">
            <Button
              className="w-full font-bold"
              variant={"secondary"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}

export default PreAssessmentSignUp;
