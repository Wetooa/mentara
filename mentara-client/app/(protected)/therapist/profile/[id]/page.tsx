'use client'

import { ProfilePage } from '@/components/profile';
import { useEffect } from 'react';
import { 
  generateProfileMetadata, 
  generateMetadataWithStructuredData,
  TherapistProfile,
  SITE_CONFIG 
} from '@/lib/metadata';

interface TherapistProfilePageProps {
  params: { id: string };
}

export default function TherapistProfilePage({ params }: TherapistProfilePageProps) {
  const { id } = params;

  // Set up client-side metadata
  useEffect(() => {
    // Set basic metadata for therapist profile
    document.title = 'Therapist Profile | Mentara';
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Licensed mental health professional profile on Mentara platform.');
    
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
        <ProfilePage userId={id} />
      </div>
    </div>
  );
}

