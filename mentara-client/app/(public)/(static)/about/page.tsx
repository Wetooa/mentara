"use client";
import React from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-white to-tertiary/5"
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="py-16 md:py-24"
      >
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              About Our Mission
            </h1>
            <div className="w-20 h-1 bg-tertiary mx-auto mb-8"></div>
            <p className="text-gray-600 text-lg mb-8">
              We&apos;re dedicated to breaking barriers in mental health
              support, providing expert guidance in a safe environment for
              everyone seeking a stronger, healthier life.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Our Story */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="py-16 bg-white"
      >
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="md:w-1/2">
              <div className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/pages/about/our-story.jpg"
                  alt="Our story"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-secondary mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 mb-4">
                Founded in 2022, our organization began with a simple but
                powerful vision: to create a world where mental wellness is
                accessible to everyone, regardless of background or
                circumstance.
              </p>
              <p className="text-gray-600 mb-4">
                What started as a small team of dedicated professionals has
                grown into a community of experts united by a passion for
                compassionate care and innovative approaches to mental health.
              </p>
              <p className="text-gray-600 mb-6">
                Today, we&apos;re proud to support thousands of individuals on
                their journey to wellness, combining evidence-based practices
                with a deeply personalized approach.
              </p>
              <Button
                variant="outline"
                className="border-tertiary text-primary hover:bg-tertiary/10"
              >
                Learn About Our Approach
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="py-16 bg-gray-50"
      >
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600">
              These principles guide everything we do, from how we develop our
              programs to how we interact with every individual we serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Compassion",
                description:
                  "We approach every interaction with empathy, understanding, and genuine care for your wellbeing.",
              },
              {
                title: "Expertise",
                description:
                  "Our team consists of certified professionals with extensive training and experience in mental health.",
              },
              {
                title: "Accessibility",
                description:
                  "We're committed to making quality mental health support available to everyone who needs it.",
              },
              {
                title: "Innovation",
                description:
                  "We continuously evolve our approaches based on the latest research and feedback from our community.",
              },
              {
                title: "Privacy",
                description:
                  "Your information and experiences are treated with the utmost confidentiality and respect.",
              },
              {
                title: "Empowerment",
                description:
                  "We believe in giving you the tools, knowledge, and support to take control of your wellness journey.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="py-16"
      >
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600">
              Our diverse team of experts is united by a shared commitment to
              your wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Adrian T. Sajulga",
                role: "Developer",
                image: "/team/sajulga.jpg",
              },
              {
                name: "Julia Laine Segundo",
                role: "Developer",
                image: "/team/segundo.jpg",
              },
              {
                name: "Tristan James Tolentino",
                role: "Developer",
                image: "/team/tolentino.jpg",
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-secondary">
                    {member.name}
                  </h3>
                  <p className="text-primary">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Call to Action */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-tertiary/15 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-border/30 shadow-2xl relative overflow-hidden">
              {/* Enhanced glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/10" />
              
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <motion.div variants={itemVariants}>
                  <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ready to Begin?
                  </Badge>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">
                    Join Our Growing{" "}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Community
                    </span>
                  </h2>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                    Take the first step toward a stronger, healthier you. Our team is ready to provide the support you need on your wellness journey.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link href="/landing">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all group"
                        >
                          <Heart className="mr-2 w-5 h-5" />
                          Get Started Today
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    </Link>
                    
                    <Link href="/community">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-primary/30 text-primary hover:bg-primary/10 font-medium px-8 py-4 rounded-xl text-lg group backdrop-blur-sm"
                        >
                          <Users className="mr-2 w-4 h-4" />
                          Explore Community
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </motion.div>
                    <span>
                      Trusted by 10,000+ individuals on their wellness journey
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
