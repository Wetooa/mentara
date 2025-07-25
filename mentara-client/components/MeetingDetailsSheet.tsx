"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  Video,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Save,
  Edit3,
  Play,
  CheckCircle,
  XCircle,
  UserX,
  ExternalLink,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  therapistName?: string;
  clientName?: string;
  meetingUrl?: string;
  notes?: string;
  duration?: number;
  client?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  };
  therapist?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
    specialization?: string;
  };
}

interface MeetingDetailsSheetProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onMeetingUpdate?: (updatedMeeting: Meeting) => void;
}

export function MeetingDetailsSheet({
  meeting,
  isOpen,
  onClose,
  onMeetingUpdate,
}: MeetingDetailsSheetProps) {
  const api = useApi();
  const [activeTab, setActiveTab] = React.useState("info");
  const [notes, setNotes] = React.useState("");
  const [isEditingNotes, setIsEditingNotes] = React.useState(false);
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);

  React.useEffect(() => {
    if (meeting) {
      setNotes(meeting.notes || "");
      setIsEditingNotes(false);
    }
  }, [meeting]);

  if (!meeting) {
    return null;
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid time";
      return format(date, "h:mm a");
    } catch {
      return "Invalid time";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "WAITING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "NO_SHOW":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleSaveNotes = async () => {
    if (!meeting) return;

    try {
      setIsSavingNotes(true);
      await api.meetings.saveNotes(meeting.id, notes);

      const updatedMeeting = { ...meeting, notes };
      onMeetingUpdate?.(updatedMeeting);
      setIsEditingNotes(false);
      toast.success("Notes saved successfully");
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStartMeeting = async () => {
    if (!meeting) return;

    try {
      await api.meetings.start(meeting.id);
      const updatedMeeting = { ...meeting, status: "IN_PROGRESS" };
      onMeetingUpdate?.(updatedMeeting);
      toast.success("Meeting started");
    } catch (error) {
      toast.error("Failed to start meeting");
    }
  };

  const handleCompleteMeeting = async () => {
    if (!meeting) return;

    try {
      await api.meetings.complete(meeting.id);
      const updatedMeeting = { ...meeting, status: "COMPLETED" };
      onMeetingUpdate?.(updatedMeeting);
      toast.success("Meeting completed");
    } catch (error) {
      toast.error("Failed to complete meeting");
    }
  };

  const handleCancelMeeting = async () => {
    if (!meeting) return;

    try {
      await api.meetings.cancel(meeting.id);
      const updatedMeeting = { ...meeting, status: "CANCELLED" };
      onMeetingUpdate?.(updatedMeeting);
      toast.success("Meeting cancelled");
    } catch (error) {
      toast.error("Failed to cancel meeting");
    }
  };

  const handleMarkNoShow = async () => {
    if (!meeting) return;

    try {
      await api.meetings.markNoShow(meeting.id);
      const updatedMeeting = { ...meeting, status: "NO_SHOW" };
      onMeetingUpdate?.(updatedMeeting);
      toast.success("Meeting marked as no-show");
    } catch (error) {
      toast.error("Failed to mark meeting as no-show");
    }
  };

  const handleOpenMeetingUrl = () => {
    if (meeting?.meetingUrl) {
      window.open(meeting.meetingUrl, "_blank");
    }
  };

  const canStartMeeting =
    meeting.status === "WAITING" ||
    meeting.status === "SCHEDULED" ||
    meeting.status === "CONFIRMED";
  const canCompleteMeeting = meeting.status === "IN_PROGRESS";
  const canCancelOrNoShow =
    meeting.status === "IN_PROGRESS" ||
    meeting.status === "SCHEDULED" ||
    meeting.status === "CONFIRMED";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg lg:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-xl font-semibold">
                {meeting.title || "Therapy Session"}
              </SheetTitle>
              <SheetDescription className="text-base">
                {formatDate(meeting.startTime)}
              </SheetDescription>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(meeting.status)} font-medium`}
            >
              {meeting.status?.toLowerCase().replace("_", " ")}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            {canStartMeeting && (
              <Button
                onClick={handleStartMeeting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-1" />
                Start Meeting
              </Button>
            )}

            {canCompleteMeeting && (
              <Button
                onClick={handleCompleteMeeting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Meeting
              </Button>
            )}

            {canCancelOrNoShow && (
              <>
                <Button
                  onClick={handleCancelMeeting}
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>

                {meeting.status === "IN_PROGRESS" && (
                  <Button
                    onClick={handleMarkNoShow}
                    size="sm"
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    No Show
                  </Button>
                )}
              </>
            )}

            {meeting.meetingUrl && (
              <Button
                onClick={handleOpenMeetingUrl}
                size="sm"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {meeting.meetingUrl.includes("http")
                  ? "Join Video"
                  : "View Location"}
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Meeting Info
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
          </TabsList>

          {/* Meeting Info Tab */}
          <TabsContent value="info" className="space-y-6">
            {/* Time & Duration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(meeting.startTime)} -{" "}
                        {formatTime(meeting.endTime)}
                      </p>
                    </div>
                  </div>
                  {meeting.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.duration} minutes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {meeting.meetingUrl && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      {meeting.meetingUrl.includes("http") ? (
                        <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                      ) : (
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          {meeting.meetingUrl.includes("http")
                            ? "Video Meeting Link"
                            : "Meeting Location"}
                        </p>
                        <p className="text-sm text-blue-800 break-all">
                          {meeting.meetingUrl}
                        </p>
                        {meeting.meetingUrl.includes("http") && (
                          <button
                            onClick={handleOpenMeetingUrl}
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                          >
                            Click to join meeting
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {meeting.therapist && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {meeting.therapist.user.firstName}{" "}
                        {meeting.therapist.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">Therapist</p>
                      {meeting.therapist.specialization && (
                        <p className="text-xs text-muted-foreground">
                          {meeting.therapist.specialization}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {meeting.client && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {meeting.client.user.firstName}{" "}
                        {meeting.client.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="text-xs text-muted-foreground">
                        {meeting.client.user.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Session Notes
                  </CardTitle>
                  {!isEditingNotes ? (
                    <Button
                      onClick={() => setIsEditingNotes(true)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setIsEditingNotes(false);
                          setNotes(meeting.notes || "");
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveNotes}
                        size="sm"
                        disabled={isSavingNotes}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingNotes ? (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add session notes, observations, and next steps..."
                    className="min-h-[200px] resize-none"
                  />
                ) : (
                  <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg">
                    {notes ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {notes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No notes added yet. Click Edit to add session notes.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Session Rate
                    </p>
                    <p className="text-lg font-semibold">₱120.00</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Duration
                    </p>
                    <p className="text-lg font-semibold">
                      {meeting.duration || 60} min
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-xl font-bold">₱120.00</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      meeting.status === "COMPLETED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }
                  >
                    {meeting.status === "COMPLETED" ? "Completed" : "Pending"}
                  </Badge>
                </div>

                {meeting.status === "COMPLETED" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Payment processed successfully
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Transaction ID: {meeting.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
