import React, { useImperativeHandle, forwardRef } from "react";
import { z } from "zod";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { useSignUp } from "@clerk/nextjs";
import { useSignUpStore } from "@/store/preassessment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Form validation schema
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

// Define a type for the exposed methods
export type PreAssessmentSignUpRef = {
  submit: () => void;
  isValid: () => boolean;
  getValues: () => z.infer<typeof formSchema>;
};

const PreAssessmentSignUp = forwardRef<PreAssessmentSignUpRef>((props, ref) => {
  const { isLoaded, signUp } = useSignUp();
  const { setDetails } = useSignUpStore();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Validate on change for real-time feedback
  });

  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(onSubmit)(),
    isValid: () => form.formState.isValid,
    getValues: () => form.getValues(),
  }));

  if (!signUp) {
    return;
  }

  const { startEmailLinkFlow } = signUp.createEmailLinkFlow();

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);

    // Store sign up data in your store
    setDetails({
      nickName: values.nickname,
      email: values.email,
      password: values.password,
    });

    // Create Clerk user
    if (isLoaded) {
      try {
        await signUp.create({
          emailAddress: values.email,
          password: values.password,
        });

        const protocol = window.location.protocol;
        const host = window.location.host;

        // Send the user an email with the email link
        const signUpAttempt = await startEmailLinkFlow({
          // URL to navigate to after the user visits the link in their email
          redirectUrl: `${protocol}//${host}/sign-up/verify`,
        });

        // Check the verification result
        const verification = signUpAttempt.verifications.emailAddress;
      } catch (error) {
        console.error("Error signing up:", error);
      }
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-lg text-center text-secondary">
          You&apos;ve completed the pre-assessment!
        </p>
      </div>
      <div className="w-full space-y-4">
        <div className="w-full flex flex-col gap-2">
          <Input
            placeholder="First name or (nickname)"
            {...form.register("nickname")}
          />
          <p className="text-[9px] w-full text-center text-black/60">
            For added privacy you can provide nickname instead of your first
            name
          </p>
          {form.formState.errors.nickname && (
            <p className="text-xs text-destructive">
              {form.formState.errors.nickname.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input placeholder="Email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Confirm Email"
            type="email"
            {...form.register("confirmEmail")}
          />
          {form.formState.errors.confirmEmail && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmEmail.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Password"
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Confirm Password"
            type="password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-center items-center gap-2">
          <Separator className="flex-1" />
          <p className="px-2 text-black/60 text-xs">or</p>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() =>
              signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/onboarding",
              })
            }
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() =>
              signUp.authenticateWithRedirect({
                strategy: "oauth_microsoft",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/onboarding",
              })
            }
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.4 2H2V11.4H11.4V2Z" fill="#F25022" />
              <path d="M11.4 12.6H2V22H11.4V12.6Z" fill="#00A4EF" />
              <path d="M22 2H12.6V11.4H22V2Z" fill="#7FBA00" />
              <path d="M22 12.6H12.6V22H22V12.6Z" fill="#FFB900" />
            </svg>
            Continue with Microsoft
          </button>

          {/* CAPTCHA Widget */}
          <div id="clerk-captcha"></div>
        </div>
      </div>
    </>
  );
});

PreAssessmentSignUp.displayName = "PreAssessmentSignUp";

export default PreAssessmentSignUp;
