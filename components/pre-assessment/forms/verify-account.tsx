import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignUpStore } from "@/store/preassessment";
import { useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function VerifyAccount() {
  const { isLoaded, signUp } = useSignUp();
  const { details } = useSignUpStore();

  if (!signUp) {
    return;
  }

  const { startEmailLinkFlow } = signUp.createEmailLinkFlow();

  async function handleResendEmail() {
    if (isLoaded) {
      try {
        const protocol = window.location.protocol;
        const host = window.location.host;

        toast.loading("Resending verification email...");

        // FIX: add logic here
        // await signUp.({
        //   redirectUrl: `${protocol}//${host}/sign-up/verify`,
        // });

        // const verification = signUpAttempt.verifications.emailAddress;
      } catch (error: unknown) {
        toast.error(`Failed to resend verification email. ${error.message}`);
      }
    }
  }

  return (
    <>
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative h-40 w-40 mb-2">
            <Image
              src="/mentara-icon.png"
              alt="mentara icon"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-6 text-center">
          <h3 className="text-3xl text-secondary font-semibold">
            Verify Your Account
          </h3>

          <p className="text-gray-600 max-w-md mx-auto">
            We&apos;ve sent a verification email to{" "}
            <span className="font-medium">{details.email}</span>. Please open
            your inbox and follow the instructions in the email to verify your
            account.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">
              Didn&apos;t receive an email?
            </p>
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full mb-3"
            >
              Resend Email
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white px-10 py-3">
        <Link
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "w-full font-bold"
          )}
          href="/"
        >
          Done
        </Link>
      </div>
    </>
  );
}
