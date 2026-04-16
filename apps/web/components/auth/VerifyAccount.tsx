"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSignUpStore } from "@/store/pre-assessment";
import { useEmailVerification } from "@/hooks/auth/useEmailVerification";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";
import { Loader2 } from "lucide-react";

export default function VerifyAccount() {
  const { details } = useSignUpStore();
  const { 
    isSending, 
    handleResendCode, 
  } = useEmailVerification();

  // If no email details available, redirect or show error
  if (!details?.email) {
    return (
      <motion.div
        variants={fadeDown}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            No Email Information Found
          </h2>
          <p className="text-gray-600">
            Please complete the sign-up process first.
          </p>
          <Link
            href="/auth/sign-up"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Back to Sign Up
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative h-40 w-40 mb-2">
            <Image
              src="/icons/mentara/mentara-icon.png"
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
              onClick={() => handleResendCode()}
              variant="outline"
              className="w-full mb-3"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend Email"
              )}
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
          href="/client/results"
        >
          Done
        </Link>
      </div>
    </motion.div>
  );
}
