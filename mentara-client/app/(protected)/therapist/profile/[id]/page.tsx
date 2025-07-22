import { ProfilePage } from '@/components/profile';

interface TherapistProfilePageProps {
  params: Promise<{ id: string }>;
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

export async function generateMetadata({ params }: TherapistProfilePageProps) {
  const { id } = await params;
  
  return {
    title: 'User Profile | Mentara',
    description: 'View user profile and activity in the Mentara mental health community.',
    robots: 'noindex, nofollow', // Privacy: don't index profile pages
  };
}