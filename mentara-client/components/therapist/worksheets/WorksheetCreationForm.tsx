'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, User, Clock, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Validation schema
const worksheetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters').max(2000, 'Instructions too long'),
  dueDate: z.date().optional(),
});

type WorksheetFormData = z.infer<typeof worksheetSchema>;

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  assessmentInfo?: {
    hasAssessment: boolean;
    assessmentType?: string;
  };
}

interface WorksheetCreationFormProps {
  client: Client;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorksheetCreationForm({ 
  client, 
  onSuccess, 
  onCancel 
}: WorksheetCreationFormProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<WorksheetFormData>({
    resolver: zodResolver(worksheetSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      instructions: '',
      dueDate: undefined,
    },
  });

  const selectedDueDate = watch('dueDate');

  // Mutation for creating worksheet
  const createWorksheetMutation = useMutation({
    mutationFn: async (data: WorksheetFormData) => {
      const response = await api.apiClient.post(
        `/therapist/clients/${client.id}/worksheets`,
        {
          title: data.title,
          instructions: data.instructions,
          dueDate: data.dueDate?.toISOString(),
        }
      );
      return response.data;
    },
    onSuccess: (result) => {
      toast.success('Worksheet assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['therapist', 'worksheets'] });
      queryClient.invalidateQueries({ queryKey: ['therapist', 'matched-clients'] });
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to assign worksheet';
      toast.error(message);
    },
  });

  const onSubmit = (data: WorksheetFormData) => {
    createWorksheetMutation.mutate(data);
  };

  // Character counts
  const titleLength = watch('title')?.length || 0;
  const instructionsLength = watch('instructions')?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Create Worksheet Assignment
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Client Info */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
          <Avatar>
            <AvatarImage src={client.profilePicture} />
            <AvatarFallback>
              {client.firstName[0]}{client.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                {client.firstName} {client.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{client.email}</span>
              {client.assessmentInfo?.hasAssessment && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {client.assessmentInfo.assessmentType}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Worksheet Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Daily Mood Tracking, Anxiety Management Exercises"
              className={cn(errors.title && "border-red-500")}
              {...register('title')}
            />
            <div className="flex justify-between text-xs">
              <span className={cn(
                "text-muted-foreground",
                errors.title && "text-red-500"
              )}>
                {errors.title?.message}
              </span>
              <span className={cn(
                "text-muted-foreground",
                titleLength > 180 && "text-yellow-600",
                titleLength > 200 && "text-red-500"
              )}>
                {titleLength}/200
              </span>
            </div>
          </div>

          {/* Instructions Field */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              placeholder="Provide clear, detailed instructions for the worksheet. Include what the client should do, how often, and any specific guidelines..."
              className={cn(
                "min-h-32 resize-none",
                errors.instructions && "border-red-500"
              )}
              {...register('instructions')}
            />
            <div className="flex justify-between text-xs">
              <span className={cn(
                "text-muted-foreground",
                errors.instructions && "text-red-500"
              )}>
                {errors.instructions?.message}
              </span>
              <span className={cn(
                "text-muted-foreground",
                instructionsLength > 1800 && "text-yellow-600",
                instructionsLength > 2000 && "text-red-500"
              )}>
                {instructionsLength}/2000
              </span>
            </div>
          </div>

          {/* Due Date Field */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDueDate ? (
                    format(selectedDueDate, "PPP")
                  ) : (
                    <span>Pick a due date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDueDate}
                  onSelect={(date) => {
                    setValue('dueDate', date);
                    setDueDateOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Assignment will be sent immediately</span>
            </div>
            
            <div className="flex gap-3">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={createWorksheetMutation.isPending}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit"
                disabled={!isValid || createWorksheetMutation.isPending}
                className="min-w-32"
              >
                {createWorksheetMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Assign Worksheet
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}