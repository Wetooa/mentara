"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Sparkles
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    title: "Expert Guidance",
    description: "Connect with certified professionals specializing in various mental health areas.",
    icon: Award,
    stats: "500+ Therapists"
  },
  {
    title: "Personalized Support",
    description: "Receive care tailored to your unique needs, goals, and personal journey.",
    icon: Heart,
    stats: "95% Success Rate"
  },
  {
    title: "Safe Environment",
    description: "Experience support in a judgment-free space focused on your wellbeing.",
    icon: Shield,
    stats: "24/7 Support"
  },
];

const benefits = [
  "Professional therapy sessions",
  "Community support groups", 
  "Personalized wellness plans",
  "Progress tracking tools",
  "Crisis intervention support",
  "Flexible scheduling options"
];

const stats = [
  { number: "10,000+", label: "Lives Changed" },
  { number: "500+", label: "Expert Therapists" },
  { number: "95%", label: "Success Rate" },
  { number: "24/7", label: "Support Available" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-tertiary via-background to-primary/10 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tertiary/30 rounded-full blur-3xl" />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container px-4 mx-auto relative z-10"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto"
          >
            {/* Left content */}
            <div className="space-y-8">
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                  🌟 Mental Health Platform
                </Badge>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
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
                className="text-xl text-muted-foreground max-w-lg leading-relaxed"
              >
                Begin your journey to wellness with personalized support from experts who understand your unique needs and are committed to your growth.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link href="/pre-assessment">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all group">
                    Get Started Today
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="border-primary/20 text-primary hover:bg-primary/10 font-medium px-8 py-4 rounded-xl text-lg group">
                    <Play className="mr-2 w-5 h-5" />
                    Learn More
                  </Button>
                </Link>
              </motion.div>

              {/* Quick stats */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right content - Hero image */}
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
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
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">
                Why Choose Mentara
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Breaking Barriers Together
              </h2>
              <Separator className="w-20 mx-auto bg-primary/30 h-1 rounded-full" />
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We&apos;re committed to making mental wellness accessible to everyone through compassionate care, innovative approaches, and a supportive community.
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
                    <Badge variant="outline" className="border-primary/20 text-primary">
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
                  <h4 className="text-xl font-semibold text-secondary mb-2">Ready to Start?</h4>
                  <p className="text-muted-foreground mb-6">Join our community and take the first step.</p>
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-tertiary/10">
        <div className="container px-4 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-border/50 shadow-xl">
              <CardContent className="p-8 md:p-12 text-center">
                <motion.div variants={itemVariants} className="mb-8">
                  <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
                    <Clock className="w-4 h-4 mr-2" />
                    Start Today
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                    Ready to Begin Your Journey?
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    Take the first step toward a stronger, healthier you with personalized support from our expert team. Your wellness journey starts with a single click.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/pre-assessment">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg group">
                      Start Your Assessment
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="ghost" size="lg" className="text-primary hover:text-primary/80 hover:bg-primary/10 font-medium px-8 py-4 rounded-xl text-lg group">
                      Learn About Our Approach
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>Trusted by 10,000+ individuals on their wellness journey</span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
