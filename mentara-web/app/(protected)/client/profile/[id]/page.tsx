'use client'

import { ProfilePage } from '@/components/profile';
import { useEffect, use } from 'react';
import { PageBreadcrumbs } from '@/components/navigation/PageBreadcrumbs';
import { BackButton } from '@/components/navigation/BackButton';

// Required for static export
export function generateStaticParams() {
  return [];
}

interface ClientProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = use(params);

  // Set up client-side metadata
  useEffect(() => {
    // Set basic metadata for client profile
    document.title = 'User Profile | Mentara';
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'View user profile and activity in the Mentara mental health community.');
    
    // Add noindex for privacy
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.getElementsByTagName('head')[0].appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-6">
          <PageBreadcrumbs />
          <BackButton label="Back" variant="ghost" />
        </div>
        <ProfilePage userId={id} />
      </div>
    </div>
  );
}

