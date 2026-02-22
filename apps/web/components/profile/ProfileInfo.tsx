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
      {/* Professional Experience Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          Professional Background
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {therapist.yearsOfExperience && (
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Experience</p>
                <p className="text-sm text-gray-600">{therapist.yearsOfExperience} years</p>
              </div>
            </div>
          )}

          {therapist.sessionLength && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Session Length</p>
                <p className="text-sm text-gray-600">{therapist.sessionLength}</p>
              </div>
            </div>
          )}
        </div>
        
        {therapist.hourlyRate && (
          <div className="mt-3 pt-3 border-t border-blue-100">
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Investment</p>
                <p className="text-sm text-gray-600">${therapist.hourlyRate}/session</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specializations/Areas of Expertise */}
      {therapist.areasOfExpertise && therapist.areasOfExpertise.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <h4 className="font-semibold text-gray-900">Areas of Expertise</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {therapist.areasOfExpertise.map((area, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200"
              >
                {area}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2 italic">
            Specialized therapeutic approaches and treatment areas
          </p>
        </div>
      )}

      {/* Languages */}
      {therapist.languages && therapist.languages.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <h4 className="font-semibold text-gray-900">Languages Offered</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {therapist.languages.map((language, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                {language}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2 italic">
            Therapy sessions available in these languages
          </p>
        </div>
      )}

      {/* Additional Professional Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Professional Note</h4>
        </div>
        <p className="text-xs text-gray-600">
          This therapist is verified and licensed to provide mental health services. 
          All sessions are conducted in a confidential and supportive environment.
        </p>
      </div>
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