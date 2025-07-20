"use client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Heart, Users, Sparkles } from "lucide-react";

const features = [
  { icon: Shield, text: "Safe & Secure" },
  { icon: Heart, text: "Expert Care" },
  { icon: Users, text: "Community Support" },
  { icon: Sparkles, text: "Personal Growth" }
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

export default function MainPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tertiary via-white to-primary/5 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-card/80 backdrop-blur-sm border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-tertiary/10 rounded-3xl" />
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-tertiary/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 w-full">
          {/* Logo section */}
          <motion.div variants={itemVariants} className="mb-8">
            <Logo />
            <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary border-primary/20">
              Mental Health Platform
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-secondary mb-4 leading-tight"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mentara
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-lg md:text-xl mb-8 max-w-md mx-auto leading-relaxed"
          >
            Your journey to wellness starts here. Experience expert care, community support, and personal growth.
          </motion.p>

          {/* Features grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {features.map(({ icon: Icon, text }, index) => (
              <motion.div
                key={text}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors"
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-secondary">{text}</span>
              </motion.div>
            ))}
          </motion.div>

          <Separator className="mb-8" />

          {/* CTA section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link href="/landing">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Continue Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <p className="text-sm text-muted-foreground">
              Join thousands on their path to better mental health
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
