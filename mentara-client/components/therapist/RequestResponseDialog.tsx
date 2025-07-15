'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User,
  Heart,
  Star,
  AlertCircle,
  Info,
  Send,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';

interface RequestResponseDialogProps {
  requestId: string;
  request: any;
  open: boolean;
  onClose: () => void;
  onRespond: (requestId: string, response: any) => void;
  isLoading?: boolean;
}

interface TimeSlot {
  date: string;
  time: string;
  duration: number;
}

export function RequestResponseDialog({
  requestId,
  request,
  open,
  onClose,
  onRespond,
  isLoading = false,
}: RequestResponseDialogProps) {
  const [responseType, setResponseType] = useState<'accept' | 'decline' | 'request_info'>('accept');
  const [message, setMessage] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([
    { date: '', time: '', duration: 60 }
  ]);
  const [questions, setQuestions] = useState<string[]>(['']);
  const [includeIntroCall, setIncludeIntroCall] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setResponseType('accept');
      setMessage('');
      setAvailableSlots([{ date: '', time: '', duration: 60 }]);
      setQuestions(['']);
      setIncludeIntroCall(false);
    }
  }, [open]);

  const handleSubmit = () => {
    const response = {
      action: responseType,
      message: message.trim() || undefined,
      ...(responseType === 'accept' && {
        availableSlots: availableSlots.filter(slot => slot.date && slot.time),
        includeIntroCall,
      }),
      ...(responseType === 'request_info' && {
        questions: questions.filter(q => q.trim()),
      }),
    };

    onRespond(requestId, response);
  };

  const addTimeSlot = () => {
    setAvailableSlots([...availableSlots, { date: '', time: '', duration: 60 }]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailableSlots(availableSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
    const updated = [...availableSlots];
    updated[index] = { ...updated[index], [field]: value };
    setAvailableSlots(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'accept': return 'bg-green-100 text-green-800 border-green-200';
      case 'decline': return 'bg-red-100 text-red-800 border-red-200';
      case 'request_info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isFormValid = () => {
    if (!message.trim()) return false;
    
    if (responseType === 'accept') {
      return availableSlots.some(slot => slot.date && slot.time);
    }
    
    if (responseType === 'request_info') {
      return questions.some(q => q.trim());
    }
    
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Respond to Client Request
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to respond to {request?.client?.firstName}'s request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request?.client?.avatarUrl} />
                  <AvatarFallback>
                    {request?.client?.firstName?.[0]}{request?.client?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {request?.client?.firstName} {request?.client?.lastName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{request?.matchScore || 0}% match</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {request?.message && (
              <CardContent className="pt-0">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm italic">"{request.message}"</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Response Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Response Type</Label>
            <RadioGroup value={responseType} onValueChange={setResponseType}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="accept" id="accept" />
                <div className="flex-1">
                  <Label htmlFor="accept" className="font-medium cursor-pointer flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Accept Request
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Accept the client and provide available time slots
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="request_info" id="request_info" />
                <div className="flex-1">
                  <Label htmlFor="request_info" className="font-medium cursor-pointer flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    Request More Information
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ask additional questions before making a decision
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="decline" id="decline" />
                <div className="flex-1">
                  <Label htmlFor="decline" className="font-medium cursor-pointer flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    Decline Request
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Politely decline with a helpful message
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Response Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {responseType === 'accept' && 'Welcome Message'}
              {responseType === 'decline' && 'Decline Message'}
              {responseType === 'request_info' && 'Introduction Message'}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder={
                responseType === 'accept' 
                  ? "Welcome the client and explain what they can expect..."
                  : responseType === 'decline' 
                  ? "Politely explain why you can't take on this client..."
                  : "Introduce yourself and explain why you need more information..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
          </div>

          {/* Accept-specific fields */}
          {responseType === 'accept' && (
            <>
              <Separator />
              
              {/* Available Time Slots */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Available Time Slots</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Slot
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {availableSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-sm">Date</Label>
                          <Input
                            type="date"
                            value={slot.date}
                            onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Time</Label>
                          <Input
                            type="time"
                            value={slot.time}
                            onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Duration (min)</Label>
                          <Input
                            type="number"
                            value={slot.duration}
                            onChange={(e) => updateTimeSlot(index, 'duration', parseInt(e.target.value))}
                            min="30"
                            max="120"
                            step="15"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      {availableSlots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="intro-call"
                    checked={includeIntroCall}
                    onCheckedChange={setIncludeIntroCall}
                    disabled={isLoading}
                  />
                  <Label htmlFor="intro-call" className="text-sm">
                    Offer a brief introductory call before the first session
                  </Label>
                </div>
              </div>
            </>
          )}

          {/* Request Info-specific fields */}
          {responseType === 'request_info' && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Questions to Ask</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Question ${index + 1}...`}
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        disabled={isLoading}
                      />
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Preview */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Response Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getResponseTypeColor(responseType)}>
                  {responseType === 'accept' && 'Request Accepted'}
                  {responseType === 'decline' && 'Request Declined'}
                  {responseType === 'request_info' && 'More Information Needed'}
                </Badge>
              </div>
              
              {message && (
                <div className="bg-white p-3 rounded border text-sm">
                  <p>{message}</p>
                </div>
              )}
              
              {responseType === 'accept' && availableSlots.some(slot => slot.date && slot.time) && (
                <div className="mt-3 p-3 bg-green-50 rounded border">
                  <p className="text-sm font-medium text-green-800 mb-2">Available Time Slots:</p>
                  <div className="space-y-1">
                    {availableSlots
                      .filter(slot => slot.date && slot.time)
                      .map((slot, index) => (
                        <div key={index} className="text-sm text-green-700">
                          {new Date(slot.date).toLocaleDateString()} at {slot.time} ({slot.duration} min)
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {responseType === 'request_info' && questions.some(q => q.trim()) && (
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                  <p className="text-sm font-medium text-blue-800 mb-2">Questions:</p>
                  <div className="space-y-1">
                    {questions
                      .filter(q => q.trim())
                      .map((question, index) => (
                        <div key={index} className="text-sm text-blue-700">
                          {index + 1}. {question}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
            className={
              responseType === 'accept' ? 'bg-green-600 hover:bg-green-700' :
              responseType === 'decline' ? 'bg-red-600 hover:bg-red-700' :
              'bg-blue-600 hover:bg-blue-700'
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Response
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

