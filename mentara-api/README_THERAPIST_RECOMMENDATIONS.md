# Therapist Recommendation System

## Overview

The therapist recommendation system matches users with therapists based on their pre-assessment results and therapist specializations. This ensures users are connected with therapists who have expertise in their specific mental health conditions.

## Backend Implementation

### Database Schema Updates

- Enhanced `Therapist` model with specialization fields:
  - `illnessSpecializations`: Array of illness names
  - `expertiseLevels`: Object mapping illness -> expertise level (1-5)
  - `treatmentSuccessRates`: Optional success rates for conditions
  - `patientSatisfaction`: Average rating (0.00-5.00)
  - `totalPatients`: Number of patients treated

### API Endpoints

#### Therapist Recommendations

- `GET /therapist-recommendations` - Get recommended therapists for user
  - Query params: `limit`, `province`, `maxHourlyRate`
  - Returns: Matched therapists with match scores

#### Therapist Management

- `GET /therapist-management/profile` - Get therapist profile
- `PUT /therapist-management/profile` - Update therapist profile
- `PUT /therapist-management/specializations` - Update specializations
- `GET /therapist-management/available-illnesses` - Get available illnesses

### Matching Algorithm

The system uses a sophisticated matching algorithm:

1. **Condition Extraction**: Extracts user conditions from pre-assessment results
2. **Severity Weighting**: Assigns weights based on condition severity
3. **Expertise Matching**: Matches user conditions with therapist specializations
4. **Score Calculation**:
   - Base score: expertise level × severity weight × 10
   - Experience bonus: years of experience × 2 (max 20)
   - Rating bonus: patient satisfaction × 10
5. **Ranking**: Sorts by match score (0-100%)

### Supported Conditions

- Stress, Anxiety, Depression, Insomnia
- Panic Disorder, Bipolar Disorder, OCD, PTSD
- Social Anxiety, Phobias, Burnout
- Eating Disorders, ADHD, Substance Abuse
- Plus 15+ additional conditions

## Frontend Integration

### Step 1: Create API Service

```typescript
// lib/api/therapist-recommendations.ts
export async function getRecommendedTherapists(params?: {
  limit?: number;
  province?: string;
  maxHourlyRate?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.province) searchParams.append('province', params.province);
  if (params?.maxHourlyRate)
    searchParams.append('maxHourlyRate', params.maxHourlyRate.toString());

  const response = await fetch(
    `/api/therapist-recommendations?${searchParams}`,
  );
  return response.json();
}
```

### Step 2: Welcome Page Integration

```typescript
// app/(protected)/user/welcome/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRecommendedTherapists } from '@/lib/api/therapist-recommendations';
import { TherapistRecommendation } from '@/types';

export default function WelcomePage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<TherapistRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await getRecommendedTherapists({ limit: 6 });
        if (response.success) {
          setRecommendations(response.data.recommendations);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Mentara!</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recommended Therapists</h2>
        <p className="text-gray-600 mb-6">
          Based on your pre-assessment, here are therapists who specialize in your needs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((therapist) => (
            <TherapistCard key={therapist.id} therapist={therapist} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Therapist Card Component

```typescript
// components/therapist/TherapistCard.tsx
interface TherapistCardProps {
  therapist: TherapistRecommendation;
}

export function TherapistCard({ therapist }: TherapistCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex items-center mb-4">
        {therapist.profileImageUrl ? (
          <img
            src={therapist.profileImageUrl}
            alt={`${therapist.firstName} ${therapist.lastName}`}
            className="w-16 h-16 rounded-full mr-4"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
            <span className="text-gray-500 text-lg">
              {therapist.firstName[0]}{therapist.lastName[0]}
            </span>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">
            {therapist.firstName} {therapist.lastName}
          </h3>
          <p className="text-gray-600">{therapist.providerType}</p>
          <div className="flex items-center mt-1">
            <span className="text-sm text-green-600 font-medium">
              {therapist.matchScore}% Match
            </span>
          </div>
        </div>
      </div>

      {therapist.bio && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {therapist.bio}
        </p>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Specializations:</h4>
        <div className="flex flex-wrap gap-1">
          {therapist.matchedConditions.slice(0, 3).map((condition) => (
            <span
              key={condition}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {condition}
            </span>
          ))}
          {therapist.matchedConditions.length > 3 && (
            <span className="text-xs text-gray-500">
              +{therapist.matchedConditions.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {therapist.patientSatisfaction && (
            <div className="flex items-center mr-4">
              <span className="text-yellow-500">★</span>
              <span className="text-sm ml-1">
                {therapist.patientSatisfaction.toFixed(1)}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600">
            {therapist.totalPatients} patients
          </span>
        </div>

        {therapist.hourlyRate && (
          <span className="text-lg font-semibold text-green-600">
            ₱{therapist.hourlyRate}/hr
          </span>
        )}
      </div>

      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
        View Profile
      </button>
    </div>
  );
}
```

## Data Flow

1. **User completes pre-assessment** → Results stored in database
2. **User visits welcome page** → System fetches recommendations
3. **Matching algorithm runs** → Calculates match scores
4. **Recommendations displayed** → Sorted by match score
5. **User selects therapist** → Proceeds to booking/consultation

## Therapist Onboarding

Therapists can set their specializations through:

1. Application form (initial specializations)
2. Profile management (update specializations)
3. Admin panel (manage expertise levels)

## Benefits

- **Personalized Matching**: Users get therapists specialized in their conditions
- **Quality Assurance**: Only verified therapists with relevant expertise
- **Transparent Scoring**: Clear match percentages and reasoning
- **Scalable System**: Easy to add new conditions and specializations
