"use client";
import React from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Users,
  Shield,
  Award,
  CheckCircle2,
  Star,
  TrendingUp,
  Sparkles,
  Globe,
  Clock,
  Target,
  BookOpen,
  UserCheck,
  Zap
} from "lucide-react";
import { useRef, useEffect, useState } from "react";

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Enhanced team stats
const aboutStats = [
  { value: 2022, label: "Founded", suffix: "" },
  { value: 500, label: "Expert Therapists", suffix: "+" },
  { value: 10000, label: "Lives Impacted", suffix: "+" },
  { value: 24, label: "Hour Support", suffix: "/7" }
];

// Animated Counter Component for about stats
const AnimatedStat = ({ value, label, suffix = "", delay = 0 }: { 
  value: number; 
  label: string; 
  suffix?: string; 
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (2000 + delay), 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const current = value * easeOut;
      
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
  }, [isInView, value, delay]);
  
  return (
    <motion.div 
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      <motion.div 
        className="text-3xl md:text-4xl font-bold text-primary mb-2"
        animate={isInView ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {count.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-sm font-medium text-muted-foreground">
        {label}
      </div>
    </motion.div>
  );
};

export default function AboutPage() {
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  
  const storyInView = useInView(storyRef, { once: true, amount: 0.2 });
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.2 });
  const teamInView = useInView(teamRef, { once: true, amount: 0.2 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div className="min-h-screen">
      {/* Dynamic Background Elements */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`
        }}
      />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(var(--primary) / 0.2) 0%, oklch(var(--background)) 40%, oklch(var(--tertiary) / 0.15) 100%)'
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-black/[0.015] bg-[size:60px_60px]" />
        
        {/* Animated background orbs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(var(--primary) / 0.15), oklch(var(--primary) / 0.05))'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(var(--tertiary) / 0.2), oklch(var(--community-warm) / 0.1))'
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container px-4 mx-auto relative z-10"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Badge variant="secondary" className="mt-6 mb-6 bg-primary/10 text-primary border-primary/20">
                  <Target className="w-4 h-4 mr-2" />
                  Our Mission & Story
                </Badge>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary mb-8 leading-tight">
                About Our{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Mission
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                We're dedicated to breaking barriers in mental health support, providing expert guidance in a safe environment for everyone seeking a stronger, healthier life.
              </p>
              
              {/* Enhanced stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {aboutStats.map((stat, index) => (
                  <AnimatedStat
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    suffix={stat.suffix}
                    delay={index * 200}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section ref={storyRef} className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community-warm/5 to-community-calm/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-community-soothing/10 rounded-full blur-3xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">
                <BookOpen className="w-4 h-4 mr-2" />
                Our Journey
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                The Story Behind Mentara
              </h2>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants} className="md:w-1/2">
              <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-tertiary/10 rounded-2xl" />
                <Image
                  src="/pages/about/our-story.jpg"
                  alt="Our story"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="md:w-1/2">
              <h3 className="text-3xl font-bold text-secondary mb-6">
                Our Story
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2022, our organization began with a simple but powerful vision: to create a world where mental wellness is accessible to everyone, regardless of background or circumstance.
                </p>
                <p>
                  What started as a small team of dedicated professionals has grown into a community of experts united by a passion for compassionate care and innovative approaches to mental health.
                </p>
                <p>
                  Today, we're proud to support thousands of individuals on their journey to wellness, combining evidence-based practices with a deeply personalized approach.
                </p>
              </div>
              
              <Link href="/landing">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6"
                >
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl group">
                    <Sparkles className="mr-2 w-4 h-4" />
                    Learn About Our Approach
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section ref={valuesRef} className="py-24 bg-gradient-to-br from-background to-community-calm/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.01] bg-[size:60px_60px]" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-community-heart/10 rounded-full blur-2xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={valuesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-community-heart/10 text-community-heart border-community-heart/20">
                <Heart className="w-4 h-4 mr-2" />
                Our Core Values
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                What Guides Us
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                These principles guide everything we do, from how we develop our programs to how we interact with every individual we serve.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={valuesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                title: "Compassion",
                description: "We approach every interaction with empathy, understanding, and genuine care for your wellbeing.",
                icon: Heart,
                gradient: "from-rose-400/20 to-pink-500/20"
              },
              {
                title: "Expertise", 
                description: "Our team consists of certified professionals with extensive training and experience in mental health.",
                icon: Award,
                gradient: "from-amber-400/20 to-orange-500/20"
              },
              {
                title: "Accessibility",
                description: "We're committed to making quality mental health support available to everyone who needs it.",
                icon: Globe,
                gradient: "from-blue-400/20 to-indigo-500/20"
              },
              {
                title: "Innovation",
                description: "We continuously evolve our approaches based on the latest research and feedback from our community.",
                icon: Sparkles,
                gradient: "from-purple-400/20 to-violet-500/20"
              },
              {
                title: "Privacy",
                description: "Your information and experiences are treated with the utmost confidentiality and respect.",
                icon: Shield,
                gradient: "from-emerald-400/20 to-teal-500/20"
              },
              {
                title: "Empowerment",
                description: "We believe in giving you the tools, knowledge, and support to take control of your wellness journey.",
                icon: Zap,
                gradient: "from-cyan-400/20 to-blue-500/20"
              },
            ].map((value, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden">
                  {/* Enhanced glassmorphism background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <value.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold text-secondary mb-3 group-hover:text-primary transition-colors duration-300">
                      {value.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community-warm/5 to-community-calm/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-community-soothing/10 rounded-full blur-3xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={teamInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-community-accent/10 text-community-accent border-community-accent/20">
                <Users className="w-4 h-4 mr-2" />
                Our Team
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Our diverse team of experts is united by a shared commitment to your wellbeing and success.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={teamInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                name: "Adrian T. Sajulga",
                role: "Lead Developer",
                image: "/team/sajulga.jpg",
              },
              {
                name: "Julia Laine Segundo", 
                role: "Frontend Developer",
                image: "/team/segundo.jpg",
              },
              {
                name: "Tristan James Tolentino",
                role: "Backend Developer", 
                image: "/team/tolentino.jpg",
              },
            ].map((member, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden">
                  {/* Enhanced glassmorphism background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85" />
                  
                  <CardContent className="p-0 relative z-10">
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-semibold text-secondary mb-1 group-hover:text-primary transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-muted-foreground">{member.role}</p>
                    </div>
                  </CardContent>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
