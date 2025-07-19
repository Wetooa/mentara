"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  Heart,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Star,
  Clock,
  MapPin,
  Award,
  Search,
  X,
  Video,
  Phone,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
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


// Mock data for communities
const mockCommunities = [
  {
    id: "1",
    name: "Anxiety & Depression Support",
    description: "A safe space for those dealing with anxiety and depression",
    memberCount: 2847,
    category: "Mental Health",
    isPopular: true,
    recentActivity: "2 hours ago",
    tags: ["anxiety", "depression", "support", "coping"],
    image: "/api/placeholder/80/80",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "2", 
    name: "Mindfulness & Meditation",
    description: "Daily meditation practices and mindfulness techniques",
    memberCount: 1923,
    category: "Wellness",
    isPopular: false,
    recentActivity: "1 hour ago",
    tags: ["meditation", "mindfulness", "peace", "wellness"],
    image: "/api/placeholder/80/80",
    color: "from-green-500 to-green-600"
  },
  {
    id: "3",
    name: "Career & Work Stress",
    description: "Managing work-life balance and career-related stress",
    memberCount: 1564,
    category: "Professional",
    isPopular: true,
    recentActivity: "30 minutes ago",
    tags: ["work", "career", "stress", "balance"],
    image: "/api/placeholder/80/80",
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "4",
    name: "LGBTQ+ Mental Health",
    description: "Safe and affirming mental health support for LGBTQ+ individuals",
    memberCount: 892,
    category: "Identity",
    isPopular: false,
    recentActivity: "1 day ago",
    tags: ["lgbtq", "identity", "support", "affirming"],
    image: "/api/placeholder/80/80",
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "5",
    name: "Student Mental Health",
    description: "Support for students dealing with academic pressure and stress",
    memberCount: 1234,
    category: "Academic",
    isPopular: true,
    recentActivity: "4 hours ago",
    tags: ["student", "academic", "pressure", "college"],
    image: "/api/placeholder/80/80",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    id: "6",
    name: "Relationship Support",
    description: "Healthy relationships and communication support",
    memberCount: 1456,
    category: "Relationships",
    isPopular: false,
    recentActivity: "6 hours ago",
    tags: ["relationships", "communication", "love", "support"],
    image: "/api/placeholder/80/80",
    color: "from-red-500 to-red-600"
  }
];

// Mock data for therapists
const mockTherapists = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Licensed Clinical Psychologist",
    specialties: ["Anxiety", "Depression", "CBT"],
    experience: 8,
    rating: 4.9,
    reviewCount: 127,
    location: "San Francisco, CA",
    languages: ["English", "Mandarin"],
    availability: "Available this week",
    sessionTypes: ["Video", "Phone", "In-person"],
    bio: "Specializing in cognitive behavioral therapy with a focus on anxiety and depression treatment.",
    image: "/api/placeholder/100/100",
    isRecommended: true,
    nextAvailable: "Tomorrow at 2:00 PM",
    sessionRate: 150
  },
  {
    id: "2",
    name: "Dr. Michael Rodriguez",
    title: "Licensed Marriage & Family Therapist",
    specialties: ["Couples Therapy", "Family Therapy", "Communication"],
    experience: 12,
    rating: 4.8,
    reviewCount: 203,
    location: "Los Angeles, CA",
    languages: ["English", "Spanish"],
    availability: "Available next week",
    sessionTypes: ["Video", "In-person"],
    bio: "Helping couples and families build stronger relationships through effective communication.",
    image: "/api/placeholder/100/100",
    isRecommended: true,
    nextAvailable: "Next Tuesday at 10:00 AM",
    sessionRate: 180
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    title: "Licensed Clinical Social Worker",
    specialties: ["Trauma", "PTSD", "EMDR"],
    experience: 6,
    rating: 4.7,
    reviewCount: 89,
    location: "New York, NY",
    languages: ["English"],
    availability: "Limited availability",
    sessionTypes: ["Video", "Phone"],
    bio: "Trauma-informed care specialist using EMDR and other evidence-based approaches.",
    image: "/api/placeholder/100/100",
    isRecommended: false,
    nextAvailable: "Next Friday at 3:00 PM",
    sessionRate: 140
  },
  {
    id: "4",
    name: "Dr. James Kim",
    title: "Licensed Professional Counselor",
    specialties: ["Addiction", "Substance Abuse", "Group Therapy"],
    experience: 10,
    rating: 4.6,
    reviewCount: 156,
    location: "Seattle, WA",
    languages: ["English", "Korean"],
    availability: "Available this week",
    sessionTypes: ["Video", "In-person", "Group"],
    bio: "Dedicated to helping individuals overcome addiction and build healthy coping mechanisms.",
    image: "/api/placeholder/100/100",
    isRecommended: true,
    nextAvailable: "Thursday at 1:00 PM",
    sessionRate: 120
  }
];

export default function RecommendationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("communities");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [isCompleting, setIsCompleting] = useState(false);

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev =>
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const filteredCommunities = mockCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || community.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredTherapists = mockTherapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialization = specializationFilter === "all" || 
                                 therapist.specialties.some(s => s.toLowerCase().includes(specializationFilter.toLowerCase()));
    return matchesSearch && matchesSpecialization;
  });

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Simulate API calls to save preferences
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mark onboarding as fully complete
    localStorage.setItem("mentara_recommendations_complete", "true");
    
    // Redirect to main dashboard
    router.push("/user/dashboard");
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "Video": return <Video className="h-3 w-3" />;
      case "Phone": return <Phone className="h-3 w-3" />;
      case "In-person": return <MapPin className="h-3 w-3" />;
      case "Group": return <Users className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Personalized Recommendations
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover communities and therapists that match your interests and needs
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                <TabsTrigger value="communities" className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Communities
                </TabsTrigger>
                <TabsTrigger value="therapists" className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4" />
                  Therapists
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Communities Tab */}
            <TabsContent value="communities" className="space-y-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Mental Health">Mental Health</SelectItem>
                      <SelectItem value="Wellness">Wellness</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Identity">Identity</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Relationships">Relationships</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Selected Communities Summary */}
                {selectedCommunities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        {selectedCommunities.length} communities selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCommunities.map(id => {
                        const community = mockCommunities.find(c => c.id === id);
                        return community ? (
                          <Badge key={id} variant="secondary" className="bg-green-100 text-green-800">
                            {community.name}
                            <button
                              onClick={() => toggleCommunity(id)}
                              className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Communities Grid */}
                <motion.div 
                  variants={containerVariants}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredCommunities.map((community) => (
                    <motion.div
                      key={community.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-full"
                    >
                      <Card className={cn(
                        "h-full cursor-pointer transition-all hover:shadow-lg",
                        selectedCommunities.includes(community.id) && "ring-2 ring-green-500 bg-green-50/50"
                      )}
                      onClick={() => toggleCommunity(community.id)}
                      >
                        <CardHeader className="relative">
                          {community.isPopular && (
                            <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold",
                              community.color
                            )}>
                              <Users className="h-8 w-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg line-clamp-2">
                                {community.name}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {community.category}
                              </Badge>
                            </div>
                          </div>
                          
                          {selectedCommunities.includes(community.id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4 p-1 bg-green-500 rounded-full text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </motion.div>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {community.description}
                          </p>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {community.memberCount.toLocaleString()} members
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {community.recentActivity}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {community.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {community.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{community.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Therapists Tab */}
            <TabsContent value="therapists" className="space-y-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search therapists or specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                      <SelectItem value="depression">Depression</SelectItem>
                      <SelectItem value="trauma">Trauma</SelectItem>
                      <SelectItem value="couples">Couples Therapy</SelectItem>
                      <SelectItem value="addiction">Addiction</SelectItem>
                      <SelectItem value="family">Family Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Selected Therapist Summary */}
                {selectedTherapist && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Therapist selected</span>
                    </div>
                    {(() => {
                      const therapist = mockTherapists.find(t => t.id === selectedTherapist);
                      return therapist ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={therapist.image} alt={therapist.name} />
                            <AvatarFallback>{therapist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-blue-800">{therapist.name}</p>
                            <p className="text-sm text-blue-600">{therapist.title}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTherapist(null)}
                            className="ml-auto text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null;
                    })()}
                  </motion.div>
                )}

                {/* Therapists List */}
                <motion.div variants={containerVariants} className="space-y-4">
                  {filteredTherapists.map((therapist) => (
                    <motion.div
                      key={therapist.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedTherapist === therapist.id && "ring-2 ring-blue-500 bg-blue-50/50",
                        therapist.isRecommended && "border-purple-200 bg-purple-50/30"
                      )}
                      onClick={() => setSelectedTherapist(therapist.id === selectedTherapist ? null : therapist.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Avatar and Basic Info */}
                            <div className="flex items-start gap-4">
                              <Avatar className="h-20 w-20">
                                <AvatarImage src={therapist.image} alt={therapist.name} />
                                <AvatarFallback className="text-lg">
                                  {therapist.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <div>
                                  <h3 className="text-xl font-semibold flex items-center gap-2">
                                    {therapist.name}
                                    {therapist.isRecommended && (
                                      <Badge className="bg-purple-500">
                                        <Award className="h-3 w-3 mr-1" />
                                        Recommended
                                      </Badge>
                                    )}
                                  </h3>
                                  <p className="text-muted-foreground">{therapist.title}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{therapist.rating}</span>
                                    <span className="text-muted-foreground">({therapist.reviewCount})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4 text-blue-500" />
                                    <span>{therapist.experience} years</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Details and Actions */}
                            <div className="flex-1 space-y-4">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {therapist.bio}
                              </p>

                              {/* Specialties */}
                              <div className="space-y-2">
                                <span className="text-sm font-medium">Specialties:</span>
                                <div className="flex flex-wrap gap-2">
                                  {therapist.specialties.map(specialty => (
                                    <Badge key={specialty} variant="outline">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Session Info */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{therapist.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-green-600 font-medium">{therapist.nextAvailable}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span>${therapist.sessionRate}/session</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {therapist.sessionTypes.map(type => (
                                      <div key={type} className="flex items-center gap-1 mr-2">
                                        {getSessionTypeIcon(type)}
                                        <span className="text-xs">{type}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Languages */}
                              <div className="flex items-center gap-2 text-sm">
                                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                <span>Languages: {therapist.languages.join(', ')}</span>
                              </div>
                            </div>

                            {/* Selection Indicator */}
                            {selectedTherapist === therapist.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="self-start p-2 bg-blue-500 rounded-full text-white"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Progress & Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 space-y-6"
          >
            {/* Progress Summary */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Selections</h3>
                  <div className="text-sm text-muted-foreground">
                    {selectedCommunities.length + (selectedTherapist ? 1 : 0)} of 2 completed
                  </div>
                </div>
                
                <Progress 
                  value={((selectedCommunities.length + (selectedTherapist ? 1 : 0)) / 2) * 100} 
                  className="mb-4" 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full",
                      selectedCommunities.length > 0 ? "bg-green-500" : "bg-gray-300"
                    )} />
                    <span>Communities: {selectedCommunities.length} selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded-full",
                      selectedTherapist ? "bg-green-500" : "bg-gray-300"
                    )} />
                    <span>Therapist: {selectedTherapist ? "Selected" : "Not selected"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complete Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleComplete}
                disabled={isCompleting || (selectedCommunities.length === 0 && !selectedTherapist)}
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isCompleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                    Setting up your experience...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {(selectedCommunities.length === 0 && !selectedTherapist) && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground"
              >
                Select at least one community or therapist to continue
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}