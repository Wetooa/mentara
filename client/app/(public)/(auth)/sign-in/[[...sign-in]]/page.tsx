"use client";
import FormFooter from "@/components/footer/form-footer";
import Logo from "@/components/logo";
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
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Form validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function SignIn() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  if (!signIn) {
    return;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoaded) {
      try {
        const signInAttempt = await signIn.create({
          identifier: values.email,
          password: values.password,
        });

        toast.info("Logging you in...");

        if (signInAttempt.status === "complete") {
          await setActive({ session: signInAttempt.createdSessionId });
          router.push("/");
          toast.success("Logged in successfully!");
        } else {
          toast.error(
            `Sign in failed! ${JSON.stringify(signInAttempt, null, 2)}`
          );
        }
      } catch (error) {
        toast.error(`Failed to resend verification email. ${error.message}`);
      }
    }
  }

  return (
    <motion.div
      variants={fadeDown}
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
              <Button
                onClick={() =>
                  signIn.authenticateWithRedirect({
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
              </Button>

              <Button
                onClick={() =>
                  signIn.authenticateWithRedirect({
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
              </Button>

              {/* CAPTCHA Widget */}
              <div id="clerk-captcha"></div>
            </div>
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
