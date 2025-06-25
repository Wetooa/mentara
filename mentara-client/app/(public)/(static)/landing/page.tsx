"use client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-tertiary/80 to-white py-16 md:py-0 border-secondary/20 border-b min-h-screen flex items-center justify-center">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-6xl mx-auto"
          >
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-8">
              <div>
                <h1 className="text-secondary text-4xl md:text-5xl font-semibold leading-tight md:leading-tight">
                  Safe Support. <br />
                  Expert Help. <br />
                  <span className="text-primary">A Stronger You.</span>
                </h1>
                <p className="mt-6 text-gray-600 text-lg max-w-md">
                  Begin your journey to wellness with personalized support from
                  experts who understand your unique needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/pre-assessment"
                  className={cn(
                    buttonVariants(),
                    "bg-tertiary hover:bg-tertiary/90 text-primary font-bold px-8 py-3 rounded-lg text-lg shadow-md transition-all"
                  )}
                >
                  Get Started
                </Link>
                <Link
                  href="/about"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-tertiary text-primary hover:bg-tertiary/10"
                  )}
                >
                  Learn More
                </Link>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative md:w-[500px] h-[400px] md:h-auto overflow-hidden"
            >
              <Image
                fill
                className="object-cover object-center"
                src="/pages/landing/woman-flower-crown.png"
                alt="Woman with flower crown"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Breaking Barriers Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Breaking Barriers Together
            </h2>
            <div className="w-20 h-1 bg-tertiary mx-auto"></div>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
              We&apos;re committed to making mental wellness accessible to
              everyone through compassionate care and innovative approaches.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Expert Guidance",
                description:
                  "Connect with certified professionals specializing in various mental health areas.",
                icon: "✓",
              },
              {
                title: "Personalized Support",
                description:
                  "Receive care tailored to your unique needs, goals, and personal journey.",
                icon: "✓",
              },
              {
                title: "Safe Environment",
                description:
                  "Experience support in a judgment-free space focused on your wellbeing.",
                icon: "✓",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-tertiary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 text-center">
            <Link
              href="/community"
              className={cn(
                buttonVariants(),
                "bg-secondary hover:bg-secondary/90 text-white font-bold px-8 py-3 rounded-lg text-lg"
              )}
            >
              Join Our Community
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials or Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-b from-white to-tertiary/10">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-secondary mb-6 text-center">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Take the first step toward a stronger, healthier you with
              personalized support from our expert team.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/pre-assessment"
                className={cn(
                  buttonVariants(),
                  "bg-tertiary hover:bg-tertiary/90 text-primary font-bold px-8 py-3"
                )}
              >
                Get Started Now
              </Link>
              <Link
                href="/about"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "text-primary hover:text-primary/80 font-medium flex items-center justify-center"
                )}
              >
                Learn More About Our Approach →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
