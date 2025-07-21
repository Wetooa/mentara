'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CalendarDays, 
  MapPin, 
  GraduationCap, 
  Clock, 
  Star,
  Eye,
  Check,
  X,
  FileText,
  CreditCard,
  // Phone,
  Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ApprovalDialog } from './ApprovalDialog';
import { RejectionDialog } from './RejectionDialog';

interface TherapistApplicationCardProps {
  therapist: Record<string, unknown>;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onViewDetails: () => void;
  onApprove: (data: Record<string, unknown>) => void;
  onReject: (data: Record<string, unknown>) => void;
  isProcessing?: boolean;
}

export function TherapistApplicationCard({
  therapist,
  isSelected,
  onSelect,
  onViewDetails,
  onApprove,
  onReject,
  isProcessing = false,
}: TherapistApplicationCardProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'suspended': return 'outline';
      default: return 'outline';
    }
  };

  const yearsOfExperience = therapist.practiceStartDate 
    ? new Date().getFullYear() - new Date(therapist.practiceStartDate as string).getFullYear()
    : 0;

  return (
    <>
      <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isProcessing ? 'opacity-60' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(therapist.id as string, !!(checked as boolean))}
                disabled={isProcessing}
              />
              
              <Avatar className="h-12 w-12">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <AvatarImage src={(therapist.user as any)?.avatarUrl} />
                <AvatarFallback>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(therapist.user as any)?.firstName?.[0]}{(therapist.user as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(therapist.user as any)?.firstName} {(therapist.user as any)?.lastName}
                  </h3>
                  <Badge variant={getStatusBadgeVariant(therapist.status as string)} className={getStatusColor(therapist.status as string)}>
                    {(therapist.status as string)?.charAt(0).toUpperCase() + (therapist.status as string)?.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span className="text-sm text-muted-foreground">{(therapist.user as any)?.email}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {(therapist.province as string) || 'Not specified'}
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {(therapist.providerType as string) || 'Not specified'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {yearsOfExperience} years experience
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    Applied {formatDistanceToNow(new Date((therapist.submissionDate || therapist.createdAt) as string), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onViewDetails} disabled={isProcessing}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              
              {therapist.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowApprovalDialog(true)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    disabled={isProcessing}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowRejectionDialog(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">License:</span>
              </div>
              <p className="text-muted-foreground">{(therapist.prcLicenseNumber as string) || 'Not provided'}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Specializations:</span>
              </div>
              <p className="text-muted-foreground">
                {(therapist.areasOfExpertise as string[])?.length > 0 ? (
                  <>
                    {(therapist.areasOfExpertise as string[]).slice(0, 2).join(', ')}
                    {(therapist.areasOfExpertise as string[]).length > 2 && ` +${(therapist.areasOfExpertise as string[]).length - 2} more`}
                  </>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Rate:</span>
              </div>
              <p className="text-muted-foreground">
                {(therapist.hourlyRate as number) ? `₱${therapist.hourlyRate}/hour` : 'Not set'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Session Length:</span>
              </div>
              <p className="text-muted-foreground">
                {(therapist.sessionDuration as number) ? `${therapist.sessionDuration} min` : 'Not set'}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          {((therapist.bio as string) || (therapist.education as string) || (therapist.yearsOfExperience as number)) && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid gap-2">
                {(therapist.bio as string) && (
                  <div>
                    <span className="font-medium text-sm">Bio:</span>
                    <p className="text-sm text-muted-foreground line-clamp-2">{therapist.bio as string}</p>
                  </div>
                )}
                
                {(therapist.education as string) && (
                  <div>
                    <span className="font-medium text-sm">Education:</span>
                    <p className="text-sm text-muted-foreground">{therapist.education as string}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {(therapist.processedBy as string) && (therapist.processedAt as string) && (
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              Processed by {therapist.processedBy as string} {formatDistanceToNow(new Date(therapist.processedAt as string), { addSuffix: true })}
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalDialog
        open={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        onApprove={onApprove}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        therapistName={`${(therapist.user as any)?.firstName} ${(therapist.user as any)?.lastName}`}
      />

      <RejectionDialog
        open={showRejectionDialog}
        onClose={() => setShowRejectionDialog(false)}
        onReject={onReject}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        therapistName={`${(therapist.user as any)?.firstName} ${(therapist.user as any)?.lastName}`}
      />
    </>
  );
}