"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Globe, 
  Star,
  GraduationCap
} from 'lucide-react';
import { PublicProfileResponse } from '@/lib/api/services/profile';

interface ProfileInfoProps {
  profile: PublicProfileResponse;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const { user, therapist } = profile;
  const isTherapist = user.role === 'therapist' && therapist;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="w-5 h-5" />
          {isTherapist ? 'Professional Info' : 'Profile Info'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Therapist-specific information */}
        {isTherapist ? (
          <TherapistInfo therapist={therapist} />
        ) : (
          <ClientInfo user={user} />
        )}
      </CardContent>
    </Card>
  );
}

function TherapistInfo({ therapist }: { therapist: NonNullable<PublicProfileResponse['therapist']> }) {
  return (
    <div className="space-y-4">
      {/* Experience */}
      {therapist.yearsOfExperience && (
        <div className="flex items-center gap-3">
          <Star className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Experience</p>
            <p className="text-sm text-gray-600">{therapist.yearsOfExperience} years</p>
          </div>
        </div>
      )}

      {/* Session Details */}
      <div className="space-y-2">
        {therapist.sessionLength && (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Session Length</p>
              <p className="text-sm text-gray-600">{therapist.sessionLength}</p>
            </div>
          </div>
        )}
        
        {therapist.hourlyRate && (
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Hourly Rate</p>
              <p className="text-sm text-gray-600">${therapist.hourlyRate}/hour</p>
            </div>
          </div>
        )}
      </div>

      {/* Specializations/Areas of Expertise */}
      {therapist.areasOfExpertise && therapist.areasOfExpertise.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-900">Areas of Expertise</p>
          </div>
          <div className="flex flex-wrap gap-1 ml-7">
            {therapist.areasOfExpertise.map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {therapist.languages && therapist.languages.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-900">Languages</p>
          </div>
          <div className="flex flex-wrap gap-1 ml-7">
            {therapist.languages.map((language, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientInfo({ user }: { user: PublicProfileResponse['user'] }) {
  return (
    <div className="space-y-4">
      {/* Role Badge */}
      <div className="flex items-center gap-3">
        <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900">Role</p>
          <Badge variant="outline" className="text-xs mt-1">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Bio (if not already shown in header) */}
      {user.bio && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 italic">"{user.bio}"</p>
        </div>
      )}

      {/* Additional client-specific info can be added here */}
      <div className="text-xs text-gray-500 italic">
        Profile information is limited for privacy protection
      </div>
    </div>
  );
}

export default ProfileInfo;