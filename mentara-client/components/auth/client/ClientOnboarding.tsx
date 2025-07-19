"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  Heart,
  MessageCircle,
  Target,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to Mentara",
    description: "Your journey to better mental health starts here",
    icon: <Sparkles className="h-8 w-8" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "goals",
    title: "Set Your Goals",
    description: "What would you like to achieve?",
    icon: <Target className="h-8 w-8" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "community",
    title: "Find Your Community",
    description: "Connect with others on similar journeys",
    icon: <Users className="h-8 w-8" />,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "therapist",
    title: "Match with a Therapist",
    description: "Get personalized professional support",
    icon: <Heart className="h-8 w-8" />,
    color: "from-red-500 to-pink-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export function ClientOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const paginate = (newDirection: number) => {
    const newStep = Math.max(0, Math.min(onboardingSteps.length - 1, currentStep + newDirection));
    if (newStep !== currentStep) {
      setDirection(newDirection);
      setCurrentStep(newStep);
    }
  };

  const handleFinish = () => {
    // Mark onboarding as complete
    localStorage.setItem("mentara_client_onboarding_complete", "true");
    // Redirect to client dashboard
    router.push("/user");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  "p-2 rounded-xl bg-gradient-to-r text-white",
                  currentStepData.color
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentStepData.icon}
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  {currentStepData.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {onboardingSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full border-2",
                      index <= currentStep
                        ? "bg-primary border-primary"
                        : "bg-transparent border-gray-300"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
              <div className="w-20 sm:w-32">
                <Progress value={progress} className="h-2" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="relative"
            >
              {/* Step Content */}
              {currentStep === 0 && <WelcomeStep />}
              {currentStep === 1 && <GoalsStep />}
              {currentStep === 2 && <CommunityStep />}
              {currentStep === 3 && <TherapistStep />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            className="flex items-center justify-between mt-8 pt-6 border-t"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={() => paginate(-1)}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {/* Completion status can be added here if needed */}
            </div>

            {currentStep === onboardingSteps.length - 1 ? (
              <Button
                onClick={handleFinish}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Get Started
                <Sparkles className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => paginate(1)}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center space-y-8"
    >
      <motion.div variants={itemVariants} className="space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to Mentara
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Your personalized journey to better mental health and wellbeing starts here
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: <Heart className="h-8 w-8 text-red-500" />,
              title: "Professional Support",
              description: "Connect with licensed therapists"
            },
            {
              icon: <Users className="h-8 w-8 text-green-500" />,
              title: "Supportive Community",
              description: "Join others on similar journeys"
            },
            {
              icon: <Target className="h-8 w-8 text-blue-500" />,
              title: "Personalized Goals",
              description: "Track your progress and growth"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-gray-50">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Goals Step Component
function GoalsStep() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: "anxiety", label: "Manage Anxiety", icon: "🧘" },
    { id: "depression", label: "Combat Depression", icon: "☀️" },
    { id: "stress", label: "Reduce Stress", icon: "🌱" },
    { id: "relationships", label: "Improve Relationships", icon: "💕" },
    { id: "self-esteem", label: "Build Self-Esteem", icon: "⭐" },
    { id: "sleep", label: "Better Sleep", icon: "🌙" },
    { id: "habits", label: "Develop Healthy Habits", icon: "🎯" },
    { id: "mindfulness", label: "Practice Mindfulness", icon: "🧠" }
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          What are your goals?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the areas you&apos;d like to focus on. You can change these anytime.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedGoals.includes(goal.id)
                    ? "ring-2 ring-purple-500 bg-purple-50"
                    : "hover:bg-gray-50"
                )}
                onClick={() => toggleGoal(goal.id)}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-3xl">{goal.icon}</div>
                  <h3 className="font-medium text-sm sm:text-base">{goal.label}</h3>
                  {selectedGoals.includes(goal.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-purple-600"
                    >
                      <CheckCircle className="h-5 w-5 mx-auto" />
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {selectedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
          </Badge>
        </motion.div>
      )}
    </motion.div>
  );
}

// Community Step Component
function CommunityStep() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Find Your Community
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with others who understand your journey and share similar experiences.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            {
              title: "Support Groups",
              description: "Join topic-specific groups for focused discussions",
              features: ["Anxiety & Depression", "Relationship Support", "Career Stress", "Student Life"],
              color: "from-blue-500 to-cyan-500"
            },
            {
              title: "Peer Connections",
              description: "Connect one-on-one with community members",
              features: ["Mentor Matching", "Study Buddies", "Accountability Partners", "Friendship Building"],
              color: "from-green-500 to-emerald-500"
            }
          ].map((section, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-r mb-4", section.color)} />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <p className="text-gray-600">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Therapist Step Component
function TherapistStep() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Match with a Therapist
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get personalized support from licensed mental health professionals.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Complete Assessment",
              description: "Answer questions about your needs and preferences",
              icon: <MessageCircle className="h-6 w-6" />
            },
            {
              step: "2", 
              title: "Get Matched",
              description: "Our algorithm finds therapists that fit your profile",
              icon: <Target className="h-6 w-6" />
            },
            {
              step: "3",
              title: "Start Sessions",
              description: "Begin your journey with professional support",
              icon: <Heart className="h-6 w-6" />
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center space-y-4"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                  {step.step}
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg">
                  {step.icon}
                </div>
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="font-semibold text-lg text-purple-900">
              Ready to get started?
            </h3>
            <p className="text-purple-700">
              Complete your onboarding to discover personalized community recommendations and get matched with the perfect therapist for your needs.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}