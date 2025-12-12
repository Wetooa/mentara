import { ProfilePage } from '@/components/profile';
import { 
  generateProfileMetadata, 
  generateMetadataWithStructuredData,
  UserProfile,
  SITE_CONFIG 
} from '@/lib/metadata';
import { Metadata } from 'next';
import { ProfilePageWrapper } from '@/components/navigation/ProfilePageWrapper';

interface ModeratorProfilePageProps {
  params: Promise<{ id: string }>;
}

// Fetch user data for metadata generation
async function getUserProfile(id: string): Promise<UserProfile | null> {
  try {
    // Call the API to get user profile data
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';
    const response = await fetch(`${apiUrl}/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache', // Cache for metadata generation
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    const user = await response.json();
    
    return {
      id: user.id,
      firstName: user.firstName || 'User',
      lastName: user.lastName || '',
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role || 'client',
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ModeratorProfilePage({ params }: ModeratorProfilePageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfilePageWrapper>
          <ProfilePage userId={id} />
        </ProfilePageWrapper>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ModeratorProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  
  // Fetch user data for dynamic metadata
  const user = await getUserProfile(id);
  
  if (!user) {
    // Fallback metadata if user not found
    return {
      title: 'User Profile | Mentara',
      description: 'View user profile and activity in the Mentara mental health community.',
      robots: 'noindex, nofollow',
    };
  }
  
  // Generate comprehensive metadata with structured data
  return generateMetadataWithStructuredData(
    {
      title: `${user.firstName} ${user.lastName} - Profile`,
      description: generateUserDescription(user),
      image: user.avatarUrl,
      keywords: [
        'user profile',
        'mental health community',
        'wellness journey',
        'community member',
      ],
      type: 'profile',
      noIndex: true, // Privacy: don't index personal profiles
      url: `/moderator/profile/${id}`,
    },
    'Person',
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role,
    }
  );
}

// Helper function to generate user description
function generateUserDescription(user: UserProfile): string {
  const fullName = `${user.firstName} ${user.lastName}`;
  
  const baseBio = user.bio || `${fullName}'s profile on Mentara mental health platform.`;
  const communityInfo = `Member of the Mentara mental wellness community.`;
  
  return `${baseBio} ${communityInfo}`.trim();
}