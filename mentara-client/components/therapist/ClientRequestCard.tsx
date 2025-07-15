'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  Star, 
  Calendar, 
  Check, 
  X, 
  MessageSquare,
  AlertCircle,
  User,
  Heart,
  TrendingUp,
  Info,
  Mail,
  Phone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ClientRequestCardProps {
  request: any;
  onQuickAccept: (requestId: string) => void;
  onQuickDecline: (requestId: string) => void;
  onOpenResponseDialog: (requestId: string) => void;
  isProcessing?: boolean;
}

export function ClientRequestCard({
  request,
  onQuickAccept,
  onQuickDecline,
  onOpenResponseDialog,
  isProcessing = false,
}: ClientRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const matchScore = request.matchScore || 0;
  const isPending = request.status === 'pending';
  const isExpired = request.status === 'expired';
  const isProcessed = request.status === 'accepted' || request.status === 'declined';

  return (
    <Card className={`transition-all ${isProcessing ? 'opacity-60' : ''} ${
      isPending ? 'border-yellow-200 bg-yellow-50/30' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={request.client?.avatarUrl} />
              <AvatarFallback className="text-lg">
                {request.client?.firstName?.[0]}{request.client?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">
                  {request.client?.firstName} {request.client?.lastName}
                </h3>
                <Badge className={getStatusColor(request.status)}>
                  {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                </Badge>
                {request.priority && (
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {request.priority} priority
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {request.client?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{request.client.location}</span>
                  </div>
                )}
              </div>
              
              {/* Match Score */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Match Score:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={matchScore} className="w-20 h-2" />
                  <span className={`text-sm font-semibold ${getMatchScoreColor(matchScore)}`}>
                    {matchScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenResponseDialog(request.id)}
                        disabled={isProcessing}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send detailed response</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickAccept(request.id)}
                  disabled={isProcessing}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickDecline(request.id)}
                  disabled={isProcessing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}
            
            {isExpired && (
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Client Message */}
        {request.message && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Client Message
            </h4>
            <p className="text-sm text-muted-foreground">
              "{request.message}"
            </p>
          </div>
        )}

        {/* Client Needs/Concerns */}
        {request.concerns?.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Primary Concerns
            </h4>
            <div className="flex flex-wrap gap-2">
              {request.concerns.map((concern, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {concern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Session Details */}
        {(request.preferredSchedule || request.sessionType || request.sessionLength) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50/50 rounded-lg">
            {request.preferredSchedule && (
              <div className="text-sm">
                <span className="font-medium text-blue-800">Preferred Schedule:</span>
                <p className="text-blue-700">{request.preferredSchedule}</p>
              </div>
            )}
            {request.sessionType && (
              <div className="text-sm">
                <span className="font-medium text-blue-800">Session Type:</span>
                <p className="text-blue-700">{request.sessionType}</p>
              </div>
            )}
            {request.sessionLength && (
              <div className="text-sm">
                <span className="font-medium text-blue-800">Session Length:</span>
                <p className="text-blue-700">{request.sessionLength} minutes</p>
              </div>
            )}
          </div>
        )}

        {/* Match Explanation */}
        {request.matchExplanation && (
          <div className="bg-green-50/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-green-800">
              <Info className="h-4 w-4" />
              Why you're a good match
            </h4>
            <div className="space-y-1 text-sm text-green-700">
              {request.matchExplanation.reasons?.map((reason, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-3 w-3 mt-0.5 text-green-600" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Info (for processed requests) */}
        {isProcessed && request.responseData && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Your Response</h4>
            <div className="text-sm text-muted-foreground">
              <p>Responded {formatDistanceToNow(new Date(request.responseData.respondedAt), { addSuffix: true })}</p>
              {request.responseData.message && (
                <p className="mt-2 italic">"{request.responseData.message}"</p>
              )}
            </div>
          </div>
        )}

        {/* Urgency Indicator */}
        {isPending && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {request.urgency === 'high' && 'Response needed within 24 hours'}
                {request.urgency === 'medium' && 'Response needed within 48 hours'}
                {request.urgency === 'low' && 'Response needed within 72 hours'}
                {!request.urgency && 'No specific timeline'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{request.clientRating || 'New'}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Client rating</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>{request.previousSessions || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous sessions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}