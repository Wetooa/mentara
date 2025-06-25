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
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ContinueWithGoogle from "@/components/auth/continue-with-google";
import ContinueWithMicrosoft from "@/components/auth/continue-with-microsoft";
import {
  usePreAssessmentChecklistStore,
  useSignUpStore,
} from "@/store/pre-assessment";
import { answersToAnswerMatrix } from "@/lib/questionnaire";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";

const formSchema = z
  .object({
    nickname: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    confirmEmail: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
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

function PreAssessmentSignUp({
  handleNextButtonOnClick,
}: PreAssessmentPageFormProps) {
  const { questionnaires, answers } = usePreAssessmentChecklistStore();
  const { setDetails } = useSignUpStore();
  const { isLoaded, signUp } = useSignUp();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  if (!signUp) {
    return null;
  }

  const { startEmailLinkFlow } = signUp.createEmailLinkFlow();

  function storeAssessmentAnswersInLocalStorage() {
    const answersList = answersToAnswerMatrix(questionnaires, answers);
    localStorage.setItem("assessmentAnswers", JSON.stringify(answersList));
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoaded) {
      storeAssessmentAnswersInLocalStorage();
      setDetails({
        nickName: values.nickname,
        email: values.email,
      });

      try {
        await signUp.create({
          emailAddress: values.email,
          password: values.password,
        });
        await signUp.update({
          publicMetadata: {
            role: "user",
          },
        });

        const protocol = window.location.protocol;
        const host = window.location.host;

        toast.info("Sending verification email...");
        startEmailLinkFlow({
          redirectUrl: `${protocol}//${host}/sign-up/verify`,
        });

        handleNextButtonOnClick();
      } catch (error) {
        toast.error(`Failed to resend verification email. ${error.message}`);
      }
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
                name="nickname"
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

            <div className="space-y-3 ">
              <Button
                onClick={() => {
                  storeAssessmentAnswersInLocalStorage();
                  toast.info("Signing in with Google...");

                  signUp.authenticateWithRedirect({
                    strategy: "oauth_google",
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/user/welcome",
                  });
                }}
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ContinueWithGoogle />
              </Button>

              {/* FIX: not working for now */}
              <Button
                onClick={() => {
                  toast.info("Microsoft SSO is not available yet.");

                  signUp.authenticateWithRedirect({
                    strategy: "oauth_microsoft",
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/user/welcome",
                  });
                }}
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ContinueWithMicrosoft />
              </Button>

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
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}

export default PreAssessmentSignUp;
