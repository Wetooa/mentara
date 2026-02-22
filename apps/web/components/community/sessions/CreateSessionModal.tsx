"use client";

import { useState } from "react";
import {
  SessionType,
  SessionFormat,
  CreateSessionRequest,
} from "@/types/api/sessions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  MapPin,
  Users,
  Calendar,
  Clock,
  Link as LinkIcon,
  Hash,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateSessionRequest) => Promise<void>;
  communityId?: string;
  roomId?: string;
}

const SESSION_FORMATS: { value: SessionFormat; label: string }[] = [
  { value: "group-therapy", label: "Group Therapy" },
  { value: "workshop", label: "Workshop" },
  { value: "support-circle", label: "Support Circle" },
  { value: "webinar", label: "Webinar" },
  { value: "meditation", label: "Meditation" },
  { value: "social", label: "Social" },
];

const POPULAR_TAGS = [
  "anxiety",
  "depression",
  "stress",
  "mindfulness",
  "coping-skills",
  "self-care",
  "relationships",
  "trauma",
  "grief",
  "anger-management",
  "sleep",
  "eating-disorders",
  "addiction",
  "ptsd",
  "bipolar",
  "ocd",
  "adhd",
  "autism",
  "social-anxiety",
  "panic-attacks",
];

export function CreateSessionModal({
  isOpen,
  onClose,
  onSubmit,
  communityId = "",
  roomId,
}: CreateSessionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState<Partial<CreateSessionRequest>>({
    title: "",
    description: "",
    type: "virtual",
    format: "workshop",
    startTime: "",
    endTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    maxParticipants: 20,
    location: "",
    meetingLink: "",
    meetingPassword: "",
    communityId,
    roomId,
    tags: [],
    requiresApproval: false,
    isRecurring: false,
  });

  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (field: keyof CreateSessionRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      handleInputChange("tags", [...(formData.tags || []), trimmedTag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    handleInputChange("tags", formData.tags?.filter((t) => t !== tag) || []);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title?.trim()) {
      toast.error("Please enter a session title");
      setCurrentTab("basic");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("Please enter a session description");
      setCurrentTab("basic");
      return;
    }
    if (!formData.startTime) {
      toast.error("Please select a start time");
      setCurrentTab("schedule");
      return;
    }
    if (!formData.endTime) {
      toast.error("Please select an end time");
      setCurrentTab("schedule");
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error("End time must be after start time");
      setCurrentTab("schedule");
      return;
    }
    if (formData.type === "in-person" && !formData.location?.trim()) {
      toast.error("Please enter a location for in-person sessions");
      setCurrentTab("location");
      return;
    }
    if (formData.type === "virtual" && !formData.meetingLink?.trim()) {
      toast.error("Please enter a meeting link for virtual sessions");
      setCurrentTab("location");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData as CreateSessionRequest);
        toast.success("Session created successfully!");
        onClose();
        resetForm();
      } else {
        // Mock submission for demo
        console.log("Creating session:", formData);
        toast.success("Session created successfully! (Demo mode)");
        onClose();
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "virtual",
      format: "workshop",
      startTime: "",
      endTime: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      maxParticipants: 20,
      location: "",
      meetingLink: "",
      meetingPassword: "",
      communityId,
      roomId,
      tags: [],
      requiresApproval: false,
      isRecurring: false,
    });
    setTagInput("");
    setCurrentTab("basic");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Set up a new group session for your community members
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="flex-1"
        >
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[50vh] px-6">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Anxiety Management Workshop"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what participants can expect from this session..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Session Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: SessionType) =>
                      handleInputChange("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Virtual
                        </div>
                      </SelectItem>
                      <SelectItem value="in-person">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          In-Person
                        </div>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Hybrid
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Session Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: SessionFormat) =>
                      handleInputChange("format", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) =>
                    handleInputChange("timezone", e.target.value)
                  }
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Timezone is automatically detected from your device
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="500"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    handleInputChange(
                      "maxParticipants",
                      parseInt(e.target.value)
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of participants allowed in this session
                </p>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-4 mt-4">
              {(formData.type === "in-person" ||
                formData.type === "hybrid") && (
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Physical Location {formData.type === "in-person" && "*"}
                  </Label>
                  <Textarea
                    id="location"
                    placeholder="Enter the full address or location details..."
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              )}

              {(formData.type === "virtual" || formData.type === "hybrid") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink">
                      Meeting Link {formData.type === "virtual" && "*"}
                    </Label>
                    <Input
                      id="meetingLink"
                      type="url"
                      placeholder="https://meet.example.com/session-123"
                      value={formData.meetingLink}
                      onChange={(e) =>
                        handleInputChange("meetingLink", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingPassword">
                      Meeting Password (Optional)
                    </Label>
                    <Input
                      id="meetingPassword"
                      type="text"
                      placeholder="Enter meeting password if required"
                      value={formData.meetingPassword}
                      onChange={(e) =>
                        handleInputChange("meetingPassword", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Only shared with registered participants
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Topics & Tags</h4>

                <div className="space-y-2">
                  <Label htmlFor="tagInput">Add Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tagInput"
                      placeholder="Type a tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Popular tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.filter((t) => !formData.tags?.includes(t))
                      .slice(0, 10)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Session Options</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requiresApproval">Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Manually approve participants before they can join
                    </p>
                  </div>
                  <Switch
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onCheckedChange={(checked) =>
                      handleInputChange("requiresApproval", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isRecurring">Recurring Session</Label>
                    <p className="text-sm text-muted-foreground">
                      This session repeats on a schedule
                    </p>
                  </div>
                  <Switch
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) =>
                      handleInputChange("isRecurring", checked)
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-6 pt-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
