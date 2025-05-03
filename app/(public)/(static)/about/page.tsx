import React from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-tertiary/5">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
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
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
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
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
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
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
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
              <div
                key={index}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-tertiary/10">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary mb-6">
              Join Our Community
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Take the first step toward a stronger, healthier you. Our team is
              ready to provide the support you need on your wellness journey.
            </p>
            <Link
              href="/landing"
              className={cn(
                buttonVariants(),
                "bg-tertiary hover:bg-tertiary/90 text-primary font-bold px-8 py-3 text-lg"
              )}
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
