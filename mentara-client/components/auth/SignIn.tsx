"use client";
import ContinueWithGoogle from "@/components/auth/ContinueWithGoogle";
import ContinueWithMicrosoft from "@/components/auth/ContinueWithMicrosoft";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fadeDown } from "@/lib/animations";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { LoginDto, LoginDtoSchema } from "mentara-commons";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SignIn() {
  const { signInWithEmail, isLoading } = useAuth();

  const form = useForm<LoginDto>({
    resolver: zodResolver(LoginDtoSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: LoginDto) {
    await signInWithEmail(values.email, values.password);
  }

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-primary-foreground rounded-3xl shadow-lg overflow-hidden max-w-[400px] w-full"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="space-y-4 w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
            <Logo />

            <div className="mb-8 text-center">
              <p className="text-xl text-center text-secondary">
                Sign in to your account
              </p>
            </div>

            <div className="space-y-6">
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
            </div>

            <div className="flex justify-center items-center gap-2">
              <Separator className="flex-1" />
              <p className="px-2 text-black/60 text-xs">or</p>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-3">
              <ContinueWithGoogle />
              <ContinueWithMicrosoft />

              {/* CAPTCHA Widget */}
              <div id="clerk-captcha"></div>
            </div>
          </div>

          <div className="bg-white px-10 py-3">
            <Button
              className="w-full font-bold"
              variant={"secondary"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/pre-assessment" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Take the pre-assessment
                </Link>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
