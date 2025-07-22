import { ProfilePage } from '@/components/profile';
import { 
  generateProfileMetadata, 
  generateMetadataWithStructuredData,
  UserProfile,
  SITE_CONFIG 
} from '@/lib/metadata';
import { Metadata } from 'next';

interface ClientProfilePageProps {
  params: Promise<{ id: string }>;
}

// Fetch client data for metadata generation
async function getClientProfile(id: string): Promise<UserProfile | null> {
  try {
    // Call the API to get client profile data
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/${id}`, {
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
    console.error('Error fetching client profile:', error);
    return null;
  }
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