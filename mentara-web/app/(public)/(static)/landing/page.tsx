"use client";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Heart,
  Users,
  CheckCircle2,
  Star,
  Clock,
  Award,
  Play,
  Sparkles,
  Zap,
  BookOpen,
  TrendingUp,
  Lock,
  Verified,
  Eye,
  FileCheck,
  UserCheck,
  Globe,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";

// Custom hook for animated counter
const useAnimatedCounter = (
  end: number,
  duration: number = 2000,
  start: number = 0
) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const current = start + (end - start) * easeOut;

      setCount(Math.floor(current));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration, start]);

  return { count, setIsVisible };
};

// Animated Counter Component
const AnimatedStat = ({
  value,
  label,
  suffix = "",
  duration = 2000,
}: {
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { count, setIsVisible } = useAnimatedCounter(value, duration);

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView, setIsVisible]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-2xl font-bold text-primary"
        animate={isInView ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {count.toLocaleString()}
        {suffix}
      </motion.div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};

const features = [
  {
    title: "Expert Guidance",
    description:
      "Connect with certified professionals specializing in various mental health areas.",
    icon: Award,
    stats: "Licensed Therapists",
    gradient: "from-amber-400/20 to-orange-500/20",
  },
  {
    title: "Personalized Support",
    description:
      "Receive care tailored to your unique needs, goals, and personal journey.",
    icon: Heart,
    stats: "95% Success Rate",
    gradient: "from-rose-400/20 to-pink-500/20",
  },
  {
    title: "Safe Environment",
    description:
      "Experience support in a judgment-free space focused on your wellbeing.",
    icon: Shield,
    stats: "24/7 Support",
    gradient: "from-emerald-400/20 to-teal-500/20",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Client since 2023",
    content:
      "Mentara helped me find the perfect therapist. The personalized matching made all the difference in my healing journey.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
  },
  {
    name: "Dr. Jennifer L.",
    role: "Licensed Therapist",
    content:
      "The platform makes it easy to connect with clients who truly need my expertise. It's rewarding to be part of this community.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
  },
  {
    name: "Michael R.",
    role: "Community Member",
    content:
      "The support groups and resources have been invaluable. I finally feel understood and supported in my mental health journey.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
  },
];

const trustElements = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All conversations and data are protected with bank-level encryption.",
    badge: "256-bit SSL",
  },
  {
    icon: Verified,
    title: "Licensed Professionals",
    description:
      "Every therapist is vetted, licensed, and continuously monitored.",
    badge: "100% Verified",
  },
  {
    icon: Eye,
    title: "Complete Privacy",
    description: "Your information is never shared. You control your data.",
    badge: "HIPAA Compliant",
  },
  {
    icon: FileCheck,
    title: "Regulatory Compliance",
    description: "Fully compliant with healthcare data protection regulations.",
    badge: "Certified",
  },
];

const benefits = [
  "Professional therapy sessions",
  "Community support groups",
  "Personalized wellness plans",
  "Progress tracking tools",
  "Crisis intervention support",
  "Flexible scheduling options",
];

const stats = [
  { value: 10000, label: "Lives Changed", suffix: "+" },
  { value: 500, label: "Expert Therapists", suffix: "+" },
  { value: 95, label: "Success Rate", suffix: "%" },
  { value: 24, label: "Hours Support", suffix: "/7" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.2,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - pt clears sticky nav; safe-area for notched mobile */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-tertiary via-background to-primary/10 overflow-hidden pb-8"
        style={{ paddingTop: "max(5rem, calc(env(safe-area-inset-top, 0px) + 3rem))" }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tertiary/30 rounded-full blur-3xl" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container px-4 sm:px-6 mx-auto relative z-10"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center max-w-7xl mx-auto"
          >
            {/* Left content */}
            <div className="space-y-6 sm:space-y-8">
              <motion.div variants={itemVariants}>
                <Badge
                  variant="secondary"
                  className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20"
                >
                  🌟 Mental Health Platform
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-secondary">Safe Support.</span>{" "}
                  <br className="hidden sm:block" />
                  <span className="text-secondary">Expert Help.</span>{" "}
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    A Stronger You.
                  </span>
                </h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-xl text-muted-foreground max-w-lg leading-relaxed"
              >
                Connecting Filipinos to the right therapist.
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-lg text-muted-foreground/90 max-w-lg leading-relaxed"
              >
                Begin your journey to wellness with personalized support from
                experts who understand your unique needs and are committed to
                your growth.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link href="/pre-assessment/chat?demo=1" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all group"
                  >
                    Talk to Mentara
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/pre-assessment" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/10 font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg group"
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto text-primary hover:bg-primary/10 font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg group"
                  >
                    <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Learn More
                  </Button>
                </Link>
              </motion.div>

              {/* Enhanced animated stats */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8"
              >
                {stats.map((stat, index) => (
                  <AnimatedStat
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    suffix={stat.suffix}
                    duration={2000 + index * 200} // Stagger animation timing
                  />
                ))}
              </motion.div>
            </div>

            {/* Right content - Hero image */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative aspect-square max-w-[280px] sm:max-w-md lg:max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-tertiary/30 rounded-3xl transform rotate-6" />
                <div className="relative bg-card rounded-3xl overflow-hidden shadow-2xl border border-border">
                  <Image
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                    src="/pages/landing/woman-flower-crown.png"
                    alt="Mental health support visualization"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container px-4 sm:px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="mb-4 bg-secondary/10 text-secondary"
              >
                Why Choose Mentara
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4 sm:mb-6">
                Breaking Barriers Together
              </h2>
              <Separator className="w-20 mx-auto bg-primary/30 h-1 rounded-full" />
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We&apos;re committed to making mental wellness accessible to
                everyone through compassionate care, innovative approaches, and
                a supportive community.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-secondary mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-primary/20 text-primary"
                    >
                      {feature.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="bg-card/50 rounded-3xl border border-border/50 p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants}>
                <h3 className="text-3xl font-bold text-secondary mb-6">
                  Everything You Need for Your Wellness Journey
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="bg-gradient-to-br from-primary/5 to-tertiary/10 rounded-2xl p-8 text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-secondary mb-2">
                    Ready to Start?
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    Join our community and take the first step.
                  </p>
                  <Link href="/community">
                    <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      Join Our Community
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        className="py-16 sm:py-24 bg-gradient-to-br from-community-warm/5 via-background to-community-calm/5 relative overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="container px-4 sm:px-6 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="mb-4 bg-community-heart/10 text-community-heart border-community-heart/20"
              >
                <Heart className="w-4 h-4 mr-2" />
                Real Stories
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4 sm:mb-6">
                Voices of Healing
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover how Mentara has transformed lives and supported
                thousands on their journey to mental wellness.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden">
                  {/* Glassmorphism background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70" />
                  <div className="absolute inset-0 bg-gradient-to-br from-community-heart/5 to-community-calm/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardContent className="p-6 relative z-10">
                    {/* Rating stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-background to-community-calm/5 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-black/[0.01] bg-[size:60px_60px]" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-community-soothing/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-community-warm/10 rounded-full blur-2xl" />

        <div className="container px-4 sm:px-6 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="mb-4 bg-community-accent/10 text-community-accent border-community-accent/20"
              >
                <Lock className="w-4 h-4 mr-2" />
                Security & Trust
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4 sm:mb-6">
                Your Safety is Our Priority
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We implement the highest standards of security and privacy to
                protect your mental health journey.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {trustElements.map((element, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/30 hover:border-community-accent/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden">
                  {/* Enhanced glassmorphism background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85" />
                  <div className="absolute inset-0 bg-gradient-to-br from-community-accent/5 to-community-calm/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-community-accent/20 to-community-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <element.icon className="w-8 h-8 text-community-accent" />
                    </motion.div>

                    <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-community-accent transition-colors duration-300">
                      {element.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {element.description}
                    </p>

                    <Badge
                      variant="outline"
                      className="border-community-accent/30 text-community-accent bg-community-accent/5 group-hover:bg-community-accent/10 transition-colors duration-300"
                    >
                      {element.badge}
                    </Badge>
                  </CardContent>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-community-accent/5 to-transparent" />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional trust indicators */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants}>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Global Standards
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Licensed Providers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Compliance Certified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Verified className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Verified Platform
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        {/* Dynamic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tertiary/15" />
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
            ease: "easeInOut",
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
                <motion.div variants={itemVariants} className="mb-8">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Badge
                      variant="secondary"
                      className="mb-4 bg-primary/10 text-primary border-primary/20"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Start Today
                    </Badge>
                  </motion.div>

                  <h2 className="text-4xl md:text-6xl font-bold text-secondary mb-6 leading-tight">
                    Ready to Begin Your{" "}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Journey?
                    </span>
                  </h2>

                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    Take the first step toward a stronger, healthier you with
                    personalized support from our expert team. Your wellness
                    journey starts with a single click.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
                >
                  <Link href="/pre-assessment">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all group"
                      >
                        <Zap className="mr-2 w-5 h-5" />
                        Start Your Assessment
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="/about">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-primary/30 text-primary hover:bg-primary/10 font-medium px-8 py-4 rounded-xl text-lg group backdrop-blur-sm"
                      >
                        <BookOpen className="mr-2 w-4 h-4" />
                        Learn Our Approach
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </motion.div>
                  <span>
                    Trusted by 10,000+ individuals on their wellness journey
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
