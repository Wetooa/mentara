'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
      <Card className={`transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-sm'
      } ${isProcessing ? 'opacity-60' : ''} rounded-lg overflow-hidden bg-white border border-gray-200`}>
        <div className="p-4">
          {/* Main Content Row: Checkbox + Avatar + Info + Actions */}
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(therapist.userId as string, !!(checked as boolean))}
                disabled={isProcessing}
                className="h-4 w-4"
              />
            </div>

            {/* Avatar with Status */}
            <div className="flex-shrink-0 relative">
              <Avatar className="h-12 w-12">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <AvatarImage src={(therapist.user as any)?.avatarUrl} />
                <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(therapist.user as any)?.firstName?.[0]}{(therapist.user as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Name and Status Row */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(therapist.user as any)?.firstName} {(therapist.user as any)?.lastName}
                </h3>
                <Badge 
                  variant={getStatusBadgeVariant(therapist.status as string)} 
                  className={`${getStatusColor(therapist.status as string)} text-xs font-medium px-2 py-1`}
                >
                  {(therapist.status as string)?.charAt(0).toUpperCase() + (therapist.status as string)?.slice(1)}
                </Badge>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-400" />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className="text-sm text-gray-600 truncate">{(therapist.user as any)?.email}</span>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{(therapist.province as string) || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{(therapist.providerType as string) || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{yearsOfExperience} years exp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">
                    Applied {formatDistanceToNow(new Date((therapist.submissionDate || therapist.createdAt) as string), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Additional Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">License</span>
                    <span className="text-sm text-gray-700 truncate block">{(therapist.prcLicenseNumber as string) || 'Not provided'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Specializations</span>
                    <span className="text-sm text-gray-700 truncate block">
                      {(therapist.areasOfExpertise as string[])?.length > 0 ? (
                        <>
                          {(therapist.areasOfExpertise as string[]).slice(0, 1).join(', ')}
                          {(therapist.areasOfExpertise as string[]).length > 1 && ` +${(therapist.areasOfExpertise as string[]).length - 1} more`}
                        </>
                      ) : (
                        'Not specified'
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Rate</span>
                    <span className="text-sm text-gray-700 truncate block">
                      {(therapist.hourlyRate as number) ? `₱${therapist.hourlyRate}/hr` : 'Not set'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Session</span>
                    <span className="text-sm text-gray-700 truncate block">
                      {(therapist.sessionDuration as number) ? `${therapist.sessionDuration} min` : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewDetails} 
                  disabled={isProcessing}
                  className="h-8 px-3 text-xs hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Details
                </Button>
                
                {therapist.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowApprovalDialog(true)}
                      className="h-8 px-3 text-xs text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                      disabled={isProcessing}
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRejectionDialog(true)}
                      className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio and Education (Collapsible) */}
          {((therapist.bio as string) || (therapist.education as string)) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                {(therapist.bio as string) && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</span>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{therapist.bio as string}</p>
                  </div>
                )}
                
                {(therapist.education as string) && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Education</span>
                    <p className="text-sm text-gray-700 mt-1">{therapist.education as string}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {(therapist.processedBy as string) && (therapist.processedAt as string) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Processed by {therapist.processedBy as string} {formatDistanceToNow(new Date(therapist.processedAt as string), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>
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