"use client";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

import Logo from "@/components/Logo";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Users,
  Heart,
  Shield,
  MessageCircle,
  UserCheck,
  Lock,
  Eye,
  Clock,
  Star,
  CheckCircle2,
  Globe,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Play
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

const communityFeatures = [
  {
    icon: Users,
    title: "Support Groups",
    description: "Find your tribe with specialized support groups tailored to your unique journey and needs.",
    gradient: "from-blue-400/20 to-indigo-500/20"
  },
  {
    icon: MessageCircle,
    title: "Safe Conversations",
    description: "Engage in meaningful discussions about mental wellness, self-care, and personal growth.",
    gradient: "from-emerald-400/20 to-teal-500/20"
  },
  {
    icon: Heart,
    title: "Peer Support",
    description: "Connect with others who understand your experiences and offer mutual encouragement.",
    gradient: "from-rose-400/20 to-pink-500/20"
  },
  {
    icon: Award,
    title: "Expert Guidance",
    description: "Access workshops and resources led by licensed mental health professionals.",
    gradient: "from-amber-400/20 to-orange-500/20"
  }
];

const safetyFeatures = [
  {
    icon: Shield,
    title: "Moderated Environment",
    description: "24/7 moderation ensures respectful, supportive interactions"
  },
  {
    icon: Lock,
    title: "Privacy Protected",
    description: "Anonymous options and strict privacy controls"
  },
  {
    icon: UserCheck,
    title: "Verified Members",
    description: "Identity verification for trusted community members"
  },
  {
    icon: Eye,
    title: "Content Guidelines",
    description: "Clear community standards for healthy interactions"
  }
];

const communityStats = [
  { value: 5000, label: "Active Members", suffix: "+" },
  { value: 150, label: "Support Groups", suffix: "+" },
  { value: 98, label: "Feel Supported", suffix: "%" },
  { value: 24, label: "Hour Moderation", suffix: "/7" }
];

export default function CommunityPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const safetyRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const safetyInView = useInView(safetyRef, { once: true, amount: 0.2 });
  
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
          background: 'linear-gradient(135deg, oklch(var(--community-warm) / 0.2) 0%, oklch(var(--background)) 40%, oklch(var(--community-calm) / 0.15) 100%)'
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-black/[0.015] bg-[size:60px_60px]" />
        
        {/* Animated background orbs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(var(--community-calm) / 0.15), oklch(var(--community-calm) / 0.05))'
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
            background: 'radial-gradient(circle, oklch(var(--community-warm) / 0.2), oklch(var(--community-heart) / 0.1))'
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
            className="absolute w-2 h-2 bg-community-calm/30 rounded-full"
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
              <Logo />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Badge variant="secondary" className="mt-6 mb-6 bg-community-heart/10 text-community-heart border-community-heart/20">
                  <Heart className="w-4 h-4 mr-2" />
                  Welcome to Our Community
                </Badge>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary mb-8 leading-tight">
                Connect, Share &{" "}
                <span className="bg-gradient-to-r from-community-heart via-community-calm to-community-accent bg-clip-text text-transparent">
                  Grow Together
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                Join a safe, supportive space where thousands find understanding, encouragement, and hope on their mental health journey.
              </p>
              
              {/* Quick action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/sign-in">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="bg-community-heart hover:bg-community-heart/90 text-community-heart-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all group"
                    >
                      <Users className="mr-2 w-5 h-5" />
                      Join the Community
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
                      className="border-community-heart/30 text-community-heart hover:bg-community-heart/10 font-medium px-8 py-4 rounded-xl text-lg group backdrop-blur-sm"
                    >
                      <Play className="mr-2 w-4 h-4" />
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
              
              {/* Community stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {communityStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="text-3xl font-bold text-community-heart mb-2">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Community Features Section */}
      <section ref={featuresRef} className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community-warm/5 to-community-calm/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-community-soothing/10 rounded-full blur-3xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-community-accent/10 text-community-accent border-community-accent/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Community Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Everything You Need to Connect
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover meaningful ways to connect, share experiences, and support each other on the path to wellness.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {communityFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/30 hover:border-community-accent/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden">
                  {/* Enhanced glassmorphism background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-900/85" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-community-accent/20 to-community-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="w-8 h-8 text-community-accent" />
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold text-secondary mb-3 group-hover:text-community-accent transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-community-accent/5 to-transparent" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section ref={safetyRef} className="py-24 bg-gradient-to-br from-background to-community-calm/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.01] bg-[size:60px_60px]" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-community-heart/10 rounded-full blur-2xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={safetyInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-community-heart/10 text-community-heart border-community-heart/20">
                <Shield className="w-4 h-4 mr-2" />
                Safety First
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Your Safety is Our Priority
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We've built comprehensive safety measures to ensure our community remains a supportive, respectful space for everyone.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={safetyInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {safetyFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="text-center p-6 rounded-xl bg-background/80 border border-border/30 hover:bg-community-warm/5 transition-colors">
                  <div className="w-12 h-12 bg-community-heart/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-community-heart" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional trust indicators */}
          <motion.div
            initial="hidden"
            animate={safetyInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants}>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">Global Community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">24/7 Moderation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">Verified Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-community-accent" />
                  <span className="text-sm font-medium text-muted-foreground">Highly Rated</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-community-heart/10 via-background to-community-calm/15 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-community-heart/10 rounded-full blur-3xl"
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
              <div className="absolute inset-0 bg-gradient-to-br from-community-heart/5 to-community-calm/10" />
              
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <motion.div variants={itemVariants}>
                  <Badge variant="secondary" className="mb-4 bg-community-heart/10 text-community-heart border-community-heart/20">
                    <Heart className="w-4 h-4 mr-2" />
                    Join Today
                  </Badge>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">
                    Ready to Find Your{" "}
                    <span className="bg-gradient-to-r from-community-heart to-community-accent bg-clip-text text-transparent">
                      Support Network?
                    </span>
                  </h2>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                    Join thousands of individuals who have found hope, understanding, and lasting connections in our supportive community.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link href="/sign-in">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="bg-community-heart hover:bg-community-heart/90 text-community-heart-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all group"
                        >
                          <Zap className="mr-2 w-5 h-5" />
                          Join the Community
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    </Link>
                    
                    <Link href="/landing">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-community-heart/30 text-community-heart hover:bg-community-heart/10 font-medium px-8 py-4 rounded-xl text-lg group backdrop-blur-sm"
                        >
                          <Users className="mr-2 w-4 h-4" />
                          Explore Platform
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
                      Trusted by 5,000+ community members worldwide
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
