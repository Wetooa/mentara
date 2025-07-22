import { ProfilePage } from '@/components/profile';
import { 
  generateProfileMetadata, 
  generateMetadataWithStructuredData,
  TherapistProfile,
  SITE_CONFIG 
} from '@/lib/metadata';
import { serverTherapistApi, serverProfileApi, safeServerApiCall } from '@/lib/api/server';
import { Metadata } from 'next';

interface TherapistProfilePageProps {
  params: Promise<{ id: string }>;
}

// Fetch therapist data for metadata generation using server-side API utilities
async function getTherapistProfile(id: string): Promise<TherapistProfile | null> {
  return await safeServerApiCall(async () => {
    // Try to get therapist data first
    const therapistData = await serverTherapistApi.getTherapist(id);
    
    if (!therapistData) {
      // Fallback to profile API if therapist API doesn't work
      const profileData = await serverProfileApi.getProfile(id);
      if (!profileData || profileData.user.role !== 'therapist') {
        return null;
      }
      
      // Transform profile data to TherapistProfile format
      return {
        id: profileData.user.id,
        firstName: profileData.user.firstName || 'Therapist',
        lastName: profileData.user.lastName || '',
        bio: profileData.user.bio,
        avatarUrl: profileData.user.avatarUrl,
        role: 'therapist',
        specializations: profileData.therapist?.specializations || [],
        approaches: profileData.therapist?.areasOfExpertise || [],
        languages: profileData.therapist?.languages || ['English'],
        yearsOfExperience: profileData.therapist?.yearsOfExperience,
        education: undefined,
        hourlyRate: profileData.therapist?.hourlyRate,
        sessionLength: profileData.therapist?.sessionLength,
      };
    }
    
    // Transform therapist API response to TherapistProfile format
    return {
      id: therapistData.userId,
      firstName: therapistData.user?.firstName || 'Therapist',
      lastName: therapistData.user?.lastName || '',
      bio: therapistData.user?.bio,
      avatarUrl: therapistData.user?.avatarUrl,
      role: 'therapist',
      specializations: therapistData.areasOfExpertise || therapistData.expertise || [],
      approaches: therapistData.therapeuticApproachesUsedList || therapistData.approaches || [],
      languages: therapistData.languagesOffered || therapistData.languages || ['English'],
      yearsOfExperience: therapistData.yearsOfExperience,
      education: therapistData.educationBackground,
      hourlyRate: therapistData.hourlyRate ? parseFloat(therapistData.hourlyRate.toString()) : undefined,
      sessionLength: therapistData.sessionLength,
    };
  });
}

export default async function TherapistProfilePage({ params }: TherapistProfilePageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfilePage userId={id} />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: TherapistProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  
  // Fetch therapist data for dynamic metadata
  const therapist = await getTherapistProfile(id);
  
  if (!therapist) {
    // Fallback metadata if therapist not found
    return {
      title: 'Therapist Profile | Mentara',
      description: 'Licensed mental health professional profile on Mentara platform.',
      robots: 'noindex, nofollow',
    };
  }
  
  // Generate comprehensive metadata with structured data
  return generateMetadataWithStructuredData(
    {
      title: `${therapist.firstName} ${therapist.lastName} - Licensed Therapist`,
      description: generateTherapistDescription(therapist),
      image: therapist.avatarUrl,
      keywords: [
        'licensed therapist',
        'mental health professional',
        ...(therapist.specializations || []),
        ...(therapist.approaches || []),
        ...(therapist.languages || []),
      ],
      type: 'profile',
      noIndex: true, // Privacy: don't index personal profiles
      url: `/therapist/profile/${id}`,
    },
    'HealthcareProvider',
    {
      id: therapist.id,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      bio: therapist.bio,
      specializations: therapist.specializations,
      approaches: therapist.approaches,
      languages: therapist.languages,
      yearsOfExperience: therapist.yearsOfExperience,
      education: therapist.education,
      hourlyRate: therapist.hourlyRate,
      sessionLength: therapist.sessionLength,
      avatarUrl: therapist.avatarUrl,
    }
  );
}

// Helper function to generate therapist description
function generateTherapistDescription(therapist: TherapistProfile): string {
  const fullName = `${therapist.firstName} ${therapist.lastName}`;
  const specializations = therapist.specializations?.length 
    ? `Specializing in ${therapist.specializations.join(', ')}.` 
    : '';
  const experience = therapist.yearsOfExperience 
    ? `${therapist.yearsOfExperience} years of experience.` 
    : '';
  const approaches = therapist.approaches?.length 
    ? `Therapeutic approaches: ${therapist.approaches.join(', ')}.` 
    : '';
  const languages = therapist.languages?.length 
    ? `Available in ${therapist.languages.join(', ')}.` 
    : '';
  
  const baseBio = therapist.bio || `Licensed mental health professional providing expert care on Mentara platform.`;
  
  return `${baseBio} ${specializations} ${experience} ${approaches} ${languages}`.trim();
}