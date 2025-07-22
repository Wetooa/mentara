import { ProfilePage } from '@/components/profile';
import { 
  generateProfileMetadata, 
  generateMetadataWithStructuredData,
  TherapistProfile,
  SITE_CONFIG 
} from '@/lib/metadata';
import { Metadata } from 'next';

interface TherapistProfilePageProps {
  params: Promise<{ id: string }>;
}

// Fetch therapist data for metadata generation
async function getTherapistProfile(id: string): Promise<TherapistProfile | null> {
  try {
    // Call the API to get therapist profile data
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/therapists/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache', // Cache for metadata generation
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    const therapist = await response.json();
    
    return {
      id: therapist.userId,
      firstName: therapist.user?.firstName || 'Therapist',
      lastName: therapist.user?.lastName || '',
      bio: therapist.user?.bio,
      avatarUrl: therapist.user?.avatarUrl,
      role: 'therapist',
      specializations: therapist.areasOfExpertise || therapist.expertise || [],
      approaches: therapist.therapeuticApproachesUsedList || therapist.approaches || [],
      languages: therapist.languagesOffered || therapist.languages || ['English'],
      yearsOfExperience: therapist.yearsOfExperience,
      education: therapist.educationBackground,
      hourlyRate: therapist.hourlyRate ? parseFloat(therapist.hourlyRate.toString()) : undefined,
      sessionLength: therapist.sessionLength,
    };
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    return null;
  }
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