import { ProfilePage } from '@/components/profile';
import { 
  generateProfileMetadata, 
  generateMetadataWithStructuredData,
  UserProfile,
  SITE_CONFIG 
} from '@/lib/metadata';
import { serverProfileApi, safeServerApiCall } from '@/lib/api/server';
import { Metadata } from 'next';

interface ClientProfilePageProps {
  params: Promise<{ id: string }>;
}

// Fetch client data for metadata generation using server-side API utilities
async function getClientProfile(id: string): Promise<UserProfile | null> {
  return await safeServerApiCall(async () => {
    const profileData = await serverProfileApi.getProfile(id);
    
    if (!profileData) {
      return null;
    }
    
    // Transform server response to match UserProfile interface
    return {
      id: profileData.user.id,
      firstName: profileData.user.firstName || 'User',
      lastName: profileData.user.lastName || '',
      bio: profileData.user.bio,
      avatarUrl: profileData.user.avatarUrl,
      role: profileData.user.role || 'client',
    };
  });
}

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfilePage userId={id} />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ClientProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  
  // Fetch client data for dynamic metadata
  const client = await getClientProfile(id);
  
  if (!client) {
    // Fallback metadata if client not found
    return {
      title: 'User Profile | Mentara',
      description: 'View user profile and activity in the Mentara mental health community.',
      robots: 'noindex, nofollow',
    };
  }
  
  // Generate comprehensive metadata with structured data
  return generateMetadataWithStructuredData(
    {
      title: `${client.firstName} ${client.lastName} - Profile`,
      description: generateClientDescription(client),
      image: client.avatarUrl,
      keywords: [
        'user profile',
        'mental health community',
        'wellness journey',
        'therapy client',
        'community member',
      ],
      type: 'profile',
      noIndex: true, // Privacy: don't index personal profiles
      url: `/client/profile/${id}`,
    },
    'Person',
    {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      bio: client.bio,
      avatarUrl: client.avatarUrl,
      role: client.role,
    }
  );
}

// Helper function to generate client description
function generateClientDescription(client: UserProfile): string {
  const fullName = `${client.firstName} ${client.lastName}`;
  
  const baseBio = client.bio || `${fullName}'s profile on Mentara mental health platform.`;
  const communityInfo = `Active member of the Mentara mental wellness community.`;
  
  return `${baseBio} ${communityInfo}`.trim();
}