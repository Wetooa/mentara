"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Clock,
  Heart,
  Shield,
  Users,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Globe
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CrisisResource {
  id: string;
  name: string;
  type: "hotline" | "chat" | "text" | "emergency" | "local" | "online";
  description: string;
  phone?: string;
  website?: string;
  textNumber?: string;
  chatUrl?: string;
  availability: "24/7" | "business_hours" | "evening" | "custom";
  customHours?: string;
  region?: string;
  languages?: string[];
  specialties?: string[];
  isPrimary?: boolean;
}

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyType?: "suicidal" | "self_harm" | "panic" | "substance" | "domestic" | "general";
}

const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: "988",
    name: "988 Suicide & Crisis Lifeline",
    type: "hotline",
    description: "Free, confidential support for people in distress and those around them.",
    phone: "988",
    website: "https://988lifeline.org",
    availability: "24/7",
    region: "United States",
    languages: ["English", "Spanish"],
    specialties: ["Suicide Prevention", "Crisis Support"],
    isPrimary: true,
  },
  {
    id: "crisis-text",
    name: "Crisis Text Line",
    type: "text",
    description: "Free, 24/7 crisis support via text message.",
    textNumber: "741741",
    website: "https://crisistextline.org",
    availability: "24/7",
    region: "United States, Canada, UK",
    languages: ["English"],
    specialties: ["Crisis Support", "Text Support"],
    isPrimary: true,
  },
  {
    id: "emergency",
    name: "Emergency Services",
    type: "emergency",
    description: "Immediate emergency response for life-threatening situations.",
    phone: "911",
    availability: "24/7",
    region: "United States",
    languages: ["English", "Spanish"],
    specialties: ["Emergency Response"],
    isPrimary: true,
  },
  {
    id: "trevor",
    name: "The Trevor Project",
    type: "hotline",
    description: "Crisis support for LGBTQ+ youth.",
    phone: "1-866-488-7386",
    website: "https://thetrevorproject.org",
    availability: "24/7",
    region: "United States",
    languages: ["English"],
    specialties: ["LGBTQ+ Support", "Youth Crisis"],
  },
  {
    id: "domestic-violence",
    name: "National Domestic Violence Hotline",
    type: "hotline",
    description: "Support for domestic violence survivors.",
    phone: "1-800-799-7233",
    website: "https://thehotline.org",
    availability: "24/7",
    region: "United States",
    languages: ["English", "Spanish"],
    specialties: ["Domestic Violence"],
  },
  {
    id: "substance-abuse",
    name: "SAMHSA National Helpline",
    type: "hotline",
    description: "Treatment referral and information service for substance abuse.",
    phone: "1-800-662-4357",
    website: "https://samhsa.gov",
    availability: "24/7",
    region: "United States",
    languages: ["English", "Spanish"],
    specialties: ["Substance Abuse", "Mental Health"],
  },
];

const SELF_CARE_RESOURCES = [
  {
    title: "Breathing Exercise",
    description: "4-7-8 breathing technique for immediate calm",
    icon: <Heart className="h-5 w-5 text-red-500" />,
    action: "Try Now",
  },
  {
    title: "Grounding Techniques",
    description: "5-4-3-2-1 sensory grounding exercise",
    icon: <Shield className="h-5 w-5 text-blue-500" />,
    action: "Learn More",
  },
  {
    title: "Safety Planning",
    description: "Create a personalized crisis safety plan",
    icon: <Users className="h-5 w-5 text-green-500" />,
    action: "Get Started",
  },
];

export function CrisisSupportModal({
  isOpen,
  onClose,
  emergencyType = "general",
}: CrisisSupportModalProps) {
  const [activeTab, setActiveTab] = useState("immediate");
  // const [selectedResource, setSelectedResource] = useState<CrisisResource | null>(null);

  // Filter resources based on emergency type and location
  const filteredResources = CRISIS_RESOURCES.filter((resource) => {
    // Always show primary resources
    if (resource.isPrimary) return true;
    
    // Filter by specialty based on emergency type
    if (emergencyType === "suicidal" && resource.specialties?.includes("Suicide Prevention")) return true;
    if (emergencyType === "domestic" && resource.specialties?.includes("Domestic Violence")) return true;
    if (emergencyType === "substance" && resource.specialties?.includes("Substance Abuse")) return true;
    
    return false;
  });

  const primaryResources = filteredResources.filter(r => r.isPrimary);
  const secondaryResources = filteredResources.filter(r => !r.isPrimary);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "hotline":
        return <Phone className="h-5 w-5" />;
      case "text":
        return <Smartphone className="h-5 w-5" />;
      case "chat":
        return <MessageCircle className="h-5 w-5" />;
      case "emergency":
        return <AlertTriangle className="h-5 w-5" />;
      case "online":
        return <Globe className="h-5 w-5" />;
      default:
        return <Phone className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "border-red-500 bg-red-50";
      case "hotline":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const handleResourceClick = (resource: CrisisResource) => {
    if (resource.phone) {
      window.open(`tel:${resource.phone}`, "_self");
    } else if (resource.website) {
      window.open(resource.website, "_blank");
    } else if (resource.chatUrl) {
      window.open(resource.chatUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Crisis Support Resources
          </DialogTitle>
          <DialogDescription>
            You&apos;re not alone. Help is available 24/7. If you&apos;re in immediate danger, please call emergency services.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency:</strong> If you are in immediate danger or having thoughts of suicide, 
            call 911 (US) or your local emergency number immediately.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="immediate">Immediate Help</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="self-care">Self-Care</TabsTrigger>
          </TabsList>

          <TabsContent value="immediate" className="space-y-4">
            {/* Primary Emergency Resources */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Emergency & Crisis Lines</h3>
              <div className="grid gap-3">
                {primaryResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-l-4",
                        getUrgencyColor(resource.type)
                      )}
                      onClick={() => handleResourceClick(resource)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-white">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{resource.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {resource.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {resource.phone && (
                                  <Badge variant="outline" className="text-xs">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {resource.phone}
                                  </Badge>
                                )}
                                {resource.textNumber && (
                                  <Badge variant="outline" className="text-xs">
                                    <Smartphone className="h-3 w-3 mr-1" />
                                    Text {resource.textNumber}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {resource.availability}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => window.open("tel:988", "_self")}
                >
                  <div className="text-left">
                    <div className="font-semibold">Call 988</div>
                    <div className="text-sm text-muted-foreground">
                      Suicide & Crisis Lifeline
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => window.open("sms:741741", "_self")}
                >
                  <div className="text-left">
                    <div className="font-semibold">Text HOME to 741741</div>
                    <div className="text-sm text-muted-foreground">
                      Crisis Text Line
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            {/* All Resources */}
            <div className="space-y-4">
              {secondaryResources.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Specialized Support</h3>
                  <div className="grid gap-3">
                    {secondaryResources.map((resource) => (
                      <Card 
                        key={resource.id}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => handleResourceClick(resource)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-muted">
                                {getResourceIcon(resource.type)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{resource.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {resource.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {resource.phone && (
                                    <Badge variant="outline" className="text-xs">
                                      {resource.phone}
                                    </Badge>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {resource.availability}
                                  </Badge>
                                  {resource.specialties?.map((specialty) => (
                                    <Badge key={specialty} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* International Resources */}
              <div className="space-y-3">
                <h3 className="font-semibold">International Resources</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        For international crisis support resources, visit:
                      </p>
                      <Button
                        variant="link"
                        onClick={() => window.open("https://findahelpline.com", "_blank")}
                        className="p-0"
                      >
                        findahelpline.com
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="self-care" className="space-y-4">
            {/* Self-Care Resources */}
            <div className="space-y-3">
              <h3 className="font-semibold">Immediate Self-Care</h3>
              <div className="grid gap-3">
                {SELF_CARE_RESOURCES.map((resource, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted">
                            {resource.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {resource.action}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Grounding Exercise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">5-4-3-2-1 Grounding Exercise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Use this technique to bring yourself back to the present moment:
                </p>
                <div className="space-y-2 text-sm">
                  <div>• <strong>5 things</strong> you can see</div>
                  <div>• <strong>4 things</strong> you can touch</div>
                  <div>• <strong>3 things</strong> you can hear</div>
                  <div>• <strong>2 things</strong> you can smell</div>
                  <div>• <strong>1 thing</strong> you can taste</div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create a Safety Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  A safety plan is a personalized list of coping strategies and support resources.
                </p>
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Start Safety Plan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Remember: Crisis support is always available. You don&apos;t have to face this alone.
          </p>
          <p className="text-xs text-muted-foreground">
            If you&apos;re experiencing a mental health emergency, please contact emergency services immediately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}