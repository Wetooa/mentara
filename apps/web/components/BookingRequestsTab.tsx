"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Check,
  X,
  MessageSquare,
  Inbox,
  CheckCircle,
  XCircle,
  MapPin,
  Video,
} from "lucide-react";
import { useBookingRequests } from "@/hooks/booking/useBooking";
import { Meeting } from "@/lib/api/services/meetings";
import { logger } from "@/lib/logger";

interface BookingRequestsTabProps {
  className?: string;
}

export function BookingRequestsTab({ className }: BookingRequestsTabProps) {
  const { 
    bookingRequests, 
    isLoading, 
    acceptRequest, 
    denyRequest, 
    isAccepting, 
    isDenying 
  } = useBookingRequests();
  
  const [denyReason, setDenyReason] = React.useState("");
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = React.useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = React.useState("");
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  
  // Only require meeting URL for in-person meetings
  const requiresMeetingUrl = acceptingRequestId && 
    bookingRequests.find(r => r.id === acceptingRequestId)?.meetingType === 'in-person';

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
      return format(date, "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getTimeUntilMeeting = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid time";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid time";
    }
  };

  const handleAccept = (request: any) => {
    setAcceptingRequestId(request.id);
    setShowAcceptDialog(true);
  };

  const handleConfirmAccept = async () => {
    if (!acceptingRequestId) return;
    
    // Only require meeting URL for in-person meetings
    if (requiresMeetingUrl && !meetingUrl.trim()) return;
    
    try {
      await acceptRequest(acceptingRequestId, requiresMeetingUrl ? meetingUrl.trim() : undefined);
      setShowAcceptDialog(false);
      setAcceptingRequestId(null);
      setMeetingUrl("");
    } catch (error) {
      logger.error('Failed to accept booking request:', error);
    }
  };

  const handleDeny = async (meetingId: string) => {
    try {
      await denyRequest(meetingId, denyReason || undefined);
      setDenyReason("");
      setSelectedRequestId(null);
    } catch (error) {
      logger.error('Failed to deny booking request:', error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      </div>
    );
  }

  if (bookingRequests.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            All caught up! You don't have any pending booking requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Booking Requests
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {bookingRequests.length} pending request{bookingRequests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          {bookingRequests.length} Pending
        </Badge>
      </div>

      {/* Booking Requests List */}
      <div className="space-y-4">
        {bookingRequests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-orange-400">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Client Info & Meeting Details */}
                <div className="flex-1 space-y-4">
                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={request.client?.user?.profilePicture} 
                        alt={`${request.client?.user?.firstName} ${request.client?.user?.lastName}`}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(request.client?.user?.firstName, request.client?.user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.client?.user?.firstName} {request.client?.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.client?.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(request.startTime)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getTimeUntilMeeting(request.startTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(request.startTime)} - {formatTime(request.endTime)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.duration || 60} minutes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.title || "Therapy Session"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Session Type
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {request.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Client Note:</strong> {request.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Button
                    onClick={() => handleAccept(request)}
                    disabled={isAccepting || isDenying}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isAccepting ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                        <span>Accepting...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isAccepting || isDenying}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => setSelectedRequestId(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Deny Booking Request
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to deny this booking request from{" "}
                          {request.client?.user?.firstName} {request.client?.user?.lastName}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="reason">Reason (Optional)</Label>
                          <Textarea
                            id="reason"
                            placeholder="Provide a reason for denying this request..."
                            value={denyReason}
                            onChange={(e) => setDenyReason(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => {
                            setDenyReason("");
                            setSelectedRequestId(null);
                          }}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => selectedRequestId && handleDeny(selectedRequestId)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDenying ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                              <span>Denying...</span>
                            </div>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Deny Request
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      {bookingRequests.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Action Required
                </span>
              </div>
              <span className="text-orange-700">
                {bookingRequests.length} request{bookingRequests.length !== 1 ? 's' : ''} awaiting response
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accept Dialog with Meeting URL */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Accept Booking Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide the meeting location or URL for this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {acceptingRequestId && bookingRequests.find(r => r.id === acceptingRequestId) && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {formatDate(bookingRequests.find(r => r.id === acceptingRequestId)?.startTime || '')} at{' '}
                    {formatTime(bookingRequests.find(r => r.id === acceptingRequestId)?.startTime || '')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Meeting Type: {bookingRequests.find(r => r.id === acceptingRequestId)?.meetingType || 'video'}
                </div>
              </div>
            )}
            
            {requiresMeetingUrl && (
              <div>
                <Label htmlFor="meetingUrl" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Meeting Address
                </Label>
                <Textarea
                  id="meetingUrl"
                  placeholder="Enter the meeting address (e.g., 123 Main St, Suite 200, City, State)"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For video meetings, the meeting link will be automatically generated.
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowAcceptDialog(false);
                setAcceptingRequestId(null);
                setMeetingUrl("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAccept}
              disabled={(requiresMeetingUrl && !meetingUrl.trim()) || isAccepting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAccepting ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                  <span>Accepting...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept Request
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}