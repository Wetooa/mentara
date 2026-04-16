"use client";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  ArrowRight, 
  Shield, 
  Heart, 
  Users, 
  Sparkles, 
  Zap,
  Globe,
  TrendingUp,
  CheckCircle2,
  Play,
  BookOpen,
  Award,
  Lock
} from "lucide-react";
import { useRef, useEffect, useState } from "react";

const features = [
  { 
    icon: Shield, 
    title: "Safe & Secure",
    description: "Bank-level encryption protects all your conversations and data",
    gradient: "from-emerald-400/20 to-teal-500/20"
  },
  { 
    icon: Heart, 
    title: "Expert Care",
    description: "Licensed professionals specialized in various mental health areas", 
    gradient: "from-rose-400/20 to-pink-500/20"
  },
  { 
    icon: Users, 
    title: "Community Support",
    description: "Connect with others on similar wellness journeys",
    gradient: "from-blue-400/20 to-indigo-500/20"
  },
  { 
    icon: Sparkles, 
    title: "Personal Growth",
    description: "Track progress and celebrate milestones together",
    gradient: "from-amber-400/20 to-orange-500/20"
  }
];

const services = [
  {
    icon: Award,
    title: "Professional Therapy",
    description: "One-on-one sessions with licensed therapists",
    link: "/landing"
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join support groups and connect with peers",
    link: "/community"
  },
  {
    icon: BookOpen,
    title: "Wellness Resources",
    description: "Access guided worksheets and self-help tools",
    link: "/about"
  }
];

const stats = [
  { value: 10000, label: "Lives Changed", suffix: "+" },
  { value: 500, label: "Expert Therapists", suffix: "+" },
  { value: 95, label: "Success Rate", suffix: "%" },
  { value: 24, label: "Hour Support", suffix: "/7" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
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

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Animated Counter Component for stats
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

export default function MainPage() {
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const statsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  
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
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`
        }}
      />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(var(--tertiary) / 0.3) 0%, oklch(var(--background)) 30%, oklch(var(--primary) / 0.1) 100%)'
        }}
      >
        {/* Enhanced Background decorations */}
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
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${15 + i * 12}%`,
              top: `${25 + i * 8}%`,
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
          className="container px-4 mx-auto relative z-10 max-w-6xl"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            {/* Logo section */}
            <motion.div variants={itemVariants} className="mb-8">
              <Logo />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Mental Health Platform
                </Badge>
              </motion.div>
            </motion.div>

            {/* Main heading */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary mb-6 leading-tight"
            >
              Welcome to{" "}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Mentara
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Your journey to <span className="text-primary font-semibold">wellness</span> starts here. 
              Experience expert care, community support, and personal growth.
            </motion.p>

            {/* Quick action buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/landing">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all group"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    Start Your Journey
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
                    <Play className="mr-2 w-4 h-4" />
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center items-center gap-6 mb-8 opacity-60"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">HIPAA Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Licensed Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Preview Section */}
      <section ref={servicesRef} className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community-warm/5 to-community-calm/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-community-soothing/10 rounded-full blur-3xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">
                Our Services
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Everything You Need for Wellness
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Comprehensive mental health support designed around your unique needs and goals.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {services.map((service, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link href={service.link}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="h-full border border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden backdrop-blur-sm rounded-2xl cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="p-8 text-center relative z-10">
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <service.icon className="w-8 h-8 text-primary" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-semibold text-secondary mb-4 group-hover:text-primary transition-colors duration-300">
                        {service.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section ref={statsRef} className="py-24 bg-gradient-to-br from-primary/5 via-background to-tertiary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-community-heart/10 text-community-heart border-community-heart/20">
                <TrendingUp className="w-4 h-4 mr-2" />
                Our Impact
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join a growing community of individuals who have found their path to better mental health.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <AnimatedStat
                key={index}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                delay={index * 200}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-community-heart/10 rounded-full blur-2xl" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                Why Choose Mentara
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Your Wellness, Our Priority
              </h2>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="h-full border border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group relative overflow-hidden backdrop-blur-sm rounded-2xl p-6 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(15px)',
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    
                    <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-tertiary/20 via-background to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.01] bg-[size:60px_60px]" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ready to Begin?
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">
                Take the First Step Toward{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Better Mental Health
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                Join thousands who have already started their wellness journey with Mentara's comprehensive mental health platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                      Start Your Journey
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
                      Join Community
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
