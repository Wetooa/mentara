# Pre-Assessment Integration Guide

## Overview

This document explains how to integrate pre-assessment results from the frontend with the backend when users sign up.

## Backend Implementation

### Database Schema

- Added `PreAssessment` model to store user assessment results
- Links to User model via `userId` and `clerkId`
- Stores questionnaires, answers, calculated scores, and severity levels

### API Endpoints

- `POST /pre-assessment` - Create pre-assessment record
- `GET /pre-assessment` - Get user's pre-assessment
- `PUT /pre-assessment` - Update pre-assessment
- `DELETE /pre-assessment` - Delete pre-assessment

### Scoring System

- Automatic calculation of questionnaire scores based on frontend data
- Severity level determination for each questionnaire
- Support for all 14 questionnaires (Stress, Anxiety, Depression, etc.)

## Frontend Integration

### Step 1: Modify Sign-Up Component

Update the sign-up component to send pre-assessment data after successful registration:

```typescript
// In PreAssessmentSignUp component
async function onSubmit(values: z.infer<typeof formSchema>) {
  if (isLoaded) {
    try {
      // Create user account
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
      });

      // Store assessment data in localStorage for later use
      const answersList = answersToAnswerMatrix(questionnaires, answers);
      localStorage.setItem('assessmentAnswers', JSON.stringify(answersList));
      localStorage.setItem(
        'assessmentQuestionnaires',
        JSON.stringify(questionnaires),
      );
      localStorage.setItem('assessmentRawAnswers', JSON.stringify(answers));

      // Continue with verification flow
      handleNextButtonOnClick();
    } catch (error) {
      toast.error(`Failed to sign up: ${error.message}`);
    }
  }
}
```

### Step 2: Create API Service

Add pre-assessment API service to frontend:

```typescript
// lib/api/pre-assessment.ts
export async function createPreAssessment(data: {
  questionnaires: string[];
  answers: number[][];
  answerMatrix: number[];
  scores?: Record<string, number>;
  severityLevels?: Record<string, string>;
}) {
  const response = await fetch('/api/pre-assessment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function getPreAssessment() {
  const response = await fetch('/api/pre-assessment');
  return response.json();
}
```

### Step 3: Submit Assessment After Verification

After email verification, submit the assessment data:

```typescript
// In verification success handler
useEffect(() => {
  if (isSignedIn && isLoaded) {
    const submitAssessment = async () => {
      try {
        const answersList = localStorage.getItem('assessmentAnswers');
        const questionnaires = localStorage.getItem('assessmentQuestionnaires');
        const rawAnswers = localStorage.getItem('assessmentRawAnswers');

        if (answersList && questionnaires && rawAnswers) {
          await createPreAssessment({
            questionnaires: JSON.parse(questionnaires),
            answers: JSON.parse(rawAnswers),
            answerMatrix: JSON.parse(answersList),
          });

          // Clear localStorage
          localStorage.removeItem('assessmentAnswers');
          localStorage.removeItem('assessmentQuestionnaires');
          localStorage.removeItem('assessmentRawAnswers');
        }
      } catch (error) {
        console.error('Failed to submit assessment:', error);
      }
    };

    submitAssessment();
  }
}, [isSignedIn, isLoaded]);
```

## Data Flow

1. **User completes pre-assessment** → Data stored in frontend state
2. **User signs up** → Account created, assessment data stored in localStorage
3. **Email verification** → User account activated
4. **Assessment submission** → Data sent to backend API
5. **Backend processing** → Scores calculated, data stored in database

## Questionnaire Scoring

The backend automatically calculates scores for:

- Stress (PSS-10)
- Anxiety (GAD-7)
- Depression (PHQ-9)
- Insomnia (ISI)
- Panic Disorder (PDSS)
- Bipolar Disorder (MDQ)
- OCD (OCI-R)
- PTSD (PCL-5)
- Social Anxiety (SPIN)
- Phobia (PHQ)
- Burnout (MBI)
- Binge Eating (BES)
- ADHD (ASRS)
- Alcohol Use (AUDIT)

Each questionnaire has specific scoring algorithms and severity level thresholds.
