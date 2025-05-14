"use client";
import ContinueWithGoogle from "@/components/auth/continue-with-google";
import ContinueWithMicrosoft from "@/components/auth/continue-with-microsoft";
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
                    redirectUrlComplete: "/user/dashboard",
                  })
                }
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ContinueWithGoogle />
              </Button>

              {/* FIX: not working for now */}
              <Button
                onClick={() =>
                  signIn.authenticateWithRedirect({
                    strategy: "oauth_microsoft",
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/user/dashboard",
                  })
                }
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ContinueWithMicrosoft />
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
