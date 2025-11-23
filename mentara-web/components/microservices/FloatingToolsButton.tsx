"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Music,
  BookOpen,
  Heart,
  X,
  ChevronUp,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CrisisSupportModal } from "@/components/crisis/CrisisSupportModal";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  component: React.ReactNode;
}

export function FloatingToolsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  const tools: Tool[] = [
    {
      id: "breathing",
      name: "Breathing Exercises",
      icon: <Wind className="h-5 w-5" />,
      description: "Guided breathing exercises to help you relax and reduce anxiety",
      component: <BreathingExerciseTool />,
    },
    {
      id: "meditation",
      name: "Meditation Guide",
      icon: <Heart className="h-5 w-5" />,
      description: "Quick meditation sessions for mindfulness and stress relief",
      component: <MeditationTool />,
    },
    {
      id: "music",
      name: "Calming Music",
      icon: <Music className="h-5 w-5" />,
      description: "Soothing sounds and music to help you find peace",
      component: <MusicTool />,
    },
    {
      id: "journal",
      name: "Quick Journal",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Write down your thoughts and feelings",
      component: <JournalTool />,
    },
  ];

  return (
    <>
      {/* Floating Button - Responsive positioning */}
      <motion.div
        initial={false}
        animate={{ scale: isOpen ? 0.9 : 1 }}
        className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label="Open wellness tools"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Tools Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <div className="px-4 sm:px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Wellness Tools
              </SheetTitle>
              <SheetDescription>
                Quick access to tools that can help you feel better right now
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-4 sm:px-6 py-6 space-y-4">
            {!selectedTool ? (
              <>
                <p className="text-sm text-gray-600">
                  Choose a tool to get started:
                </p>
                
                {/* Crisis Support - Prominent First Option */}
                <Card
                  className="cursor-pointer hover:border-red-500/50 transition-all hover:shadow-lg border-2 border-red-500/30 bg-gradient-to-br from-red-50/50 to-red-100/30"
                  onClick={() => setShowCrisisSupport(true)}
                >
                  <CardHeader className="pb-4 p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl text-red-600 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-red-700">One Tap Crisis Support</CardTitle>
                        <CardDescription className="text-sm mt-1.5 leading-relaxed text-red-600/80">
                          Immediate help and resources when you need them most
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid gap-4">
                  {tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg border-2"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      <CardHeader className="pb-4 p-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl text-primary flex-shrink-0">
                            {tool.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold">{tool.name}</CardTitle>
                            <CardDescription className="text-sm mt-1.5 leading-relaxed">
                              {tool.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTool(null)}
                  className="mb-2 -ml-2 hover:bg-primary/10"
                >
                  <ChevronUp className="h-4 w-4 mr-2 rotate-90" />
                  Back to Tools
                </Button>
                <div className="pt-2">
                  {tools.find((t) => t.id === selectedTool)?.component}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Crisis Support Modal */}
      <CrisisSupportModal
        isOpen={showCrisisSupport}
        onClose={() => setShowCrisisSupport(false)}
        emergencyType="general"
      />
    </>
  );
}

// Breathing Exercise Tool Component
function BreathingExerciseTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Switch to next phase: inhale (4s) → hold (4s) → exhale (4s) → repeat
          if (phase === "inhale") {
            setPhase("hold");
            return 4;
          } else if (phase === "hold") {
            setPhase("exhale");
            return 4;
          } else {
            // exhale → back to inhale
            setPhase("inhale");
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase]);

  const cycle = {
    inhale: { label: "Breathe In", color: "bg-gradient-to-br from-primary to-primary/80" },
    hold: { label: "Hold", color: "bg-gradient-to-br from-primary/80 to-primary/60" },
    exhale: { label: "Breathe Out", color: "bg-gradient-to-br from-primary/60 to-primary/40" },
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setPhase("inhale");
    setCountdown(4);
  };

  // Get animation keyframes based on phase
  const getAnimation = () => {
    if (!isRunning) return { scale: 1 };
    
    if (phase === "inhale") {
      // Expand from 1 to 1.4 over 4 seconds
      return {
        scale: [1, 1.4],
      };
    } else if (phase === "exhale") {
      // Contract from 1.4 to 0.9 over 4 seconds
      return {
        scale: [1.4, 0.9],
      };
    } else {
      // Hold at 1.4
      return {
        scale: 1.4,
      };
    }
  };

  // Get transition duration based on phase
  const getTransition = () => {
    if (phase === "inhale" || phase === "exhale") {
      return {
        duration: 4,
        ease: "easeInOut",
        repeat: 0,
      };
    }
    return {
      duration: 0.1,
      ease: "easeInOut",
    };
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wind className="h-5 w-5 text-primary" />
          </div>
          Breathing Exercise
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          Follow the rhythm to calm your mind and body
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-2">
        <div className="flex items-center justify-center h-72 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6">
          <motion.div
            key={`${phase}-${countdown}`}
            className={cn(
              "w-40 h-40 rounded-full flex items-center justify-center text-white font-semibold shadow-xl",
              cycle[phase].color
            )}
            animate={getAnimation()}
            transition={getTransition()}
          >
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{countdown}</div>
              <div className="text-sm font-medium">{cycle[phase].label}</div>
            </div>
          </motion.div>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => {
              if (isRunning) {
                handleStop();
              } else {
                handleStart();
              }
            }}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isRunning ? "Pause Exercise" : "Start Exercise"}
          </Button>
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Focus on your breathing and let the rhythm guide you. Inhale through your nose, exhale through your mouth.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Meditation Tool Component
function MeditationTool() {
  const [selectedDuration, setSelectedDuration] = useState<5 | 10 | 15>(5);
  const [isMeditating, setIsMeditating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!isMeditating || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsMeditating(false);
          setIsPaused(false);
          setShowCompletion(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMeditating, isPaused]);

  const handleStart = () => {
    setTimeRemaining(selectedDuration * 60);
    setIsMeditating(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsMeditating(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setShowCompletion(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeRemaining > 0 ? ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100 : 0;

  if (isMeditating || timeRemaining > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-0 z-[100] bg-primary/95 flex items-center justify-center"
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.35) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.4) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative z-10 flex flex-col items-center justify-center space-y-8 p-8"
        >
          {/* Beating Heart */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart className="h-32 w-32 text-red-400 fill-red-400" />
          </motion.div>

          {/* Timer */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-white mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-white/80 text-lg text-center max-w-md">
            {isPaused 
              ? "Take your time. Press play when you're ready to continue."
              : "Focus on your breath. Let thoughts come and go without judgment."}
          </p>

          {/* Controls */}
          <div className="flex gap-4">
            <Button
              onClick={handlePause}
              variant="outline"
              size="lg"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              onClick={handleStop}
              variant="outline"
              size="lg"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              End
            </Button>
          </div>
        </motion.div>

        {/* Completion Message */}
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          >
            <Card className="max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-center">Meditation Complete</CardTitle>
                <CardDescription className="text-center">
                  Great job! Take a moment to notice how you feel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    setTimeRemaining(0);
                    setIsMeditating(false);
                    setShowCompletion(false);
                  }}
                  className="w-full"
                >
                  Return
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          Meditation Guide
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          Quick mindfulness sessions for stress relief
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-2">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-center">
          <Heart className="h-16 w-16 text-primary/40 mx-auto mb-4 animate-pulse" />
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            Find a comfortable position and take a moment to be present. Let go of distractions and focus on your breath.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Select Duration</p>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map((duration) => (
                <Button
                  key={duration}
                  variant={selectedDuration === duration ? "default" : "outline"}
                  onClick={() => setSelectedDuration(duration as 5 | 10 | 15)}
                  className="h-12"
                >
                  {duration} min
                </Button>
              ))}
            </div>
          </div>
          <Button 
            className="w-full h-12 text-base font-semibold" 
            size="lg"
            onClick={handleStart}
          >
            Start {selectedDuration}-Minute Meditation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Music Tool Component
function MusicTool() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Royalty-free calming music URLs (using placeholder structure - can be replaced with actual hosted files)
  const tracks = [
    { 
      id: "nature", 
      name: "Nature Sounds", 
      icon: "🌲", 
      description: "Forest ambiance and water sounds",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Placeholder - replace with actual nature sounds
    },
    { 
      id: "instrumental", 
      name: "Instrumental", 
      icon: "🎹", 
      description: "Calming piano and strings",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" // Placeholder - replace with actual instrumental
    },
    { 
      id: "white-noise", 
      name: "White Noise", 
      icon: "🌊", 
      description: "Soothing background sounds",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" // Placeholder - replace with actual white noise
    },
    { 
      id: "ocean", 
      name: "Ocean Waves", 
      icon: "🌊", 
      description: "Gentle waves for relaxation",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" // Placeholder - replace with actual ocean waves
    },
  ];

  // Initialize audio element
  useEffect(() => {
    if (selectedTrack && typeof window !== "undefined") {
      const track = tracks.find(t => t.id === selectedTrack);
      if (track && !audioRef.current) {
        audioRef.current = new Audio(track.url);
        audioRef.current.loop = true;
        audioRef.current.volume = volume;
        
        audioRef.current.addEventListener("timeupdate", () => {
          if (audioRef.current) {
            const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(progressPercent);
          }
        });

        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
        });

        audioRef.current.addEventListener("error", (e) => {
          console.error("Audio error:", e);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!audioRef.current || !selectedTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    // Stop current track if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    
    if (selectedTrack === trackId) {
      setSelectedTrack(null);
    } else {
      setSelectedTrack(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const currentTrack = tracks.find(t => t.id === selectedTrack);

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Music className="h-5 w-5 text-primary" />
          </div>
          Calming Music
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          Soothing sounds and music for relaxation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-2">
        <p className="text-sm text-muted-foreground mb-4">
          Select a calming track to help you relax and focus.
        </p>
        <div className="space-y-3">
          {tracks.map((track) => (
            <Button
              key={track.id}
              variant={selectedTrack === track.id ? "default" : "outline"}
              onClick={() => handleTrackSelect(track.id)}
              className="w-full justify-start h-auto py-4 px-4 text-left hover:bg-primary/10"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="text-2xl">{track.icon}</div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{track.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{track.description}</div>
                </div>
                {selectedTrack === track.id && (
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
            </Button>
          ))}
        </div>

        {selectedTrack && currentTrack && (
          <div className="mt-6 space-y-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentTrack.icon}</div>
              <div className="flex-1">
                <div className="font-semibold">{currentTrack.name}</div>
                <div className="text-xs text-muted-foreground">{currentTrack.description}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="flex-1"
                disabled={!audioRef.current}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMuteToggle}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Journal Tool Component
function JournalTool() {
  const [entry, setEntry] = useState("");
  const api = useApi();
  const router = useRouter();

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      return await api.journal.createEntry({ content });
    },
    onSuccess: () => {
      toast.success("Journal entry saved!");
      setEntry("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save journal entry");
    },
  });

  const handleSave = () => {
    if (entry.trim()) {
      saveMutation.mutate(entry.trim());
    }
  };

  const handleClear = () => {
    if (entry.trim() && confirm("Are you sure you want to clear your entry?")) {
      setEntry("");
    }
  };

  const handleViewEntries = () => {
    router.push("/client/journal");
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          Quick Journal
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          Express your thoughts and feelings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6 pt-2">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4">
          <p className="text-sm text-muted-foreground text-center">
            Take a moment to reflect. Write whatever comes to mind - no judgment, just you and your thoughts.
          </p>
        </div>
        <div className="space-y-3">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="How are you feeling right now? What's on your mind?"
            className="w-full min-h-[250px] p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 text-sm leading-relaxed"
            disabled={saveMutation.isPending}
          />
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-11" 
              onClick={handleClear}
              disabled={!entry.trim() || saveMutation.isPending}
            >
              Clear
            </Button>
            <Button 
              className="flex-1 h-11 font-semibold" 
              onClick={handleSave}
              disabled={!entry.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full h-11"
            onClick={handleViewEntries}
          >
            View All Entries
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
