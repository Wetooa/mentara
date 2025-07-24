/**
 * Therapy Data Generator
 * 
 * Creates meetings, worksheets, assessments, and other therapy-related data
 */

import { PrismaClient } from '@prisma/client';
import { TherapyConfig, WORKSHEET_TEMPLATES, SESSION_ACTIVITIES } from '../config';
import { RelationshipsData } from './relationships';
import { UsersData } from './users';

export interface TherapyData {
  meetings: any[];
  worksheets: any[];
  assessments: any[];
  reviews: any[];
  meetingNotes: any[];
}

/**
 * Generate therapy-related data
 */
export async function generateTherapyData(
  prisma: PrismaClient,
  config: TherapyConfig,
  relationshipsData: RelationshipsData,
  usersData: UsersData
): Promise<TherapyData> {
  console.log('  Creating therapy data...');
  
  const result: TherapyData = {
    meetings: [],
    worksheets: [],
    assessments: [],
    reviews: [],
    meetingNotes: [],
  };

  // Create meetings for each client-therapist relationship
  await createMeetings(prisma, config, relationshipsData, result);

  // Create worksheets
  await createWorksheets(prisma, config, relationshipsData, result);

  // Create pre-assessments for clients
  await createAssessments(prisma, config, usersData, result);

  // Create reviews
  await createReviews(prisma, config, relationshipsData, result);

  // Create meeting notes
  await createMeetingNotes(prisma, config, result);

  console.log(`    ✅ ${result.meetings.length} meetings created`);
  console.log(`    ✅ ${result.worksheets.length} worksheets created`);
  console.log(`    ✅ ${result.assessments.length} assessments created`);
  console.log(`    ✅ ${result.reviews.length} reviews created`);

  return result;
}

/**
 * Create therapy meetings
 */
async function createMeetings(
  prisma: PrismaClient,
  config: TherapyConfig,
  relationshipsData: RelationshipsData,
  result: TherapyData
): Promise<void> {
  for (const relationshipData of relationshipsData.clientTherapistRelationships) {
    const { relationship, client, therapist } = relationshipData;
    
    // Skip inactive relationships
    if (relationship.status !== 'active') continue;

    const meetingsToCreate = randomInt(1, config.meetingsPerRelationship);
    const relationshipStart = new Date(relationship.assignedAt);
    
    for (let i = 0; i < meetingsToCreate; i++) {
      // Schedule meetings progressively in the future from relationship start
      const daysSinceStart = i * 7 + randomInt(0, 6); // Weekly sessions with some variation
      const meetingDate = new Date(relationshipStart.getTime() + daysSinceStart * 24 * 60 * 60 * 1000);
      
      // Determine if meeting is in past, present, or future
      const now = new Date();
      const isPast = meetingDate < now;
      const isWithinWeek = Math.abs(meetingDate.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;
      
      let status = 'SCHEDULED';
      if (isPast) {
        status = Math.random() > 0.1 ? 'COMPLETED' : 'CANCELLED'; // 90% completion rate
      } else if (isWithinWeek) {
        status = Math.random() > 0.95 ? 'CANCELLED' : 'SCHEDULED'; // 5% cancellation rate for upcoming
      }

      try {
        const meeting = await prisma.meeting.create({
          data: {
            title: `Therapy Session ${i + 1}`,
            description: generateSessionDescription(),
            startTime: meetingDate,
            endTime: new Date(meetingDate.getTime() + 60 * 60 * 1000), // 1 hour sessions
            duration: 60,
            status: status as any,
            meetingType: 'video',
            meetingUrl: `https://mentara.meet/session/${generateSessionId()}`,
            clientId: client.id,
            therapistId: therapist.id,
            createdAt: new Date(relationshipStart.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000),
          },
        });
        
        result.meetings.push(meeting);
      } catch (error) {
        console.log(`    ⚠️  Failed to create meeting: ${error}`);
      }
    }
  }
}

/**
 * Create therapy worksheets
 */
async function createWorksheets(
  prisma: PrismaClient,
  config: TherapyConfig,
  relationshipsData: RelationshipsData,
  result: TherapyData
): Promise<void> {
  for (const relationshipData of relationshipsData.clientTherapistRelationships) {
    const { relationship, client, therapist } = relationshipData;
    
    // Skip inactive relationships
    if (relationship.status !== 'active') continue;

    const worksheetsToCreate = randomInt(1, config.worksheetsPerRelationship);
    const relationshipStart = new Date(relationship.assignedAt);
    
    for (let i = 0; i < worksheetsToCreate; i++) {
      const template = randomChoice(WORKSHEET_TEMPLATES);
      const assignmentDate = new Date(relationshipStart.getTime() + i * 10 * 24 * 60 * 60 * 1000); // Every 10 days
      const dueDate = new Date(assignmentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week to complete
      
      // Determine status based on due date
      const now = new Date();
      let status = 'ASSIGNED';
      if (now > dueDate) {
        status = Math.random() < 0.75 ? 'SUBMITTED' : 'ASSIGNED'; // 75% submission rate
        if (status === 'SUBMITTED' && Math.random() < 0.6) {
          status = 'REVIEWED'; // 60% of submitted get reviewed
        }
      }

      try {
        const worksheet = await prisma.worksheet.create({
          data: {
            title: template.title,
            instructions: generateWorksheetInstructions(template),
            dueDate,
            status: status as any,
            clientId: client.id,
            therapistId: therapist.id,
            createdAt: assignmentDate,
          },
        });
        
        result.worksheets.push(worksheet);

        // Create submission if worksheet was submitted
        if (status === 'SUBMITTED' || status === 'REVIEWED') {
          const submissionDate = new Date(dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
          
          try {
            await prisma.worksheetSubmission.create({
              data: {
                worksheetId: worksheet.id,
                fileUrls: [`https://mentara-storage.s3.amazonaws.com/worksheets/${generateFileId()}.pdf`],
                fileNames: [`${template.title.replace(/\s+/g, '_').toLowerCase()}_submission.pdf`],
                fileSizes: [randomInt(50000, 500000)], // 50KB to 500KB
                submittedAt: submissionDate,
                feedback: status === 'REVIEWED' ? generateWorksheetFeedback() : null,
              },
            });
          } catch (error) {
            // Skip if submission already exists
          }
        }
      } catch (error) {
        console.log(`    ⚠️  Failed to create worksheet: ${error}`);
      }
    }
  }
}

/**
 * Create pre-assessments for clients
 */
async function createAssessments(
  prisma: PrismaClient,
  config: TherapyConfig,
  usersData: UsersData,
  result: TherapyData
): Promise<void> {
  for (const clientData of usersData.clients) {
    // Only create assessments for some clients
    if (Math.random() > config.assessmentCompletionRate) continue;

    try {
      const assessment = await prisma.preAssessment.create({
        data: {
          clientId: clientData.user.id,
          answers: generateAssessmentResponses(),
          scores: generateAssessmentScores(),
          severityLevels: generateSeverityLevels(),
          aiEstimate: generateAiEstimate(),
          isProcessed: true,
          processedAt: randomPastDate(180),
        },
      });
      
      result.assessments.push(assessment);
    } catch (error) {
      console.log(`    ⚠️  Failed to create assessment: ${error}`);
    }
  }
}

/**
 * Create therapist reviews
 */
async function createReviews(
  prisma: PrismaClient,
  config: TherapyConfig,
  relationshipsData: RelationshipsData,
  result: TherapyData
): Promise<void> {
  for (const relationshipData of relationshipsData.clientTherapistRelationships) {
    const { relationship, client, therapist } = relationshipData;
    
    // Only create reviews for some relationships
    if (Math.random() > config.reviewRate) continue;

    // Find a completed meeting to review
    const eligibleMeetings = result.meetings.filter(m => 
      m.clientId === client.id && 
      m.therapistId === therapist.id && 
      m.status === 'COMPLETED'
    );

    if (eligibleMeetings.length === 0) continue;

    const meetingToReview = randomChoice(eligibleMeetings);
    const rating = generateRealistictRating();

    try {
      const review = await prisma.review.create({
        data: {
          rating,
          content: generateReviewComment(rating),
          clientId: client.id,
          therapistId: therapist.id,
          meetingId: meetingToReview.id,
          createdAt: new Date(meetingToReview.endTime.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000), // 1-7 days after meeting
        },
      });
      
      result.reviews.push(review);
    } catch (error) {
      console.log(`    ⚠️  Failed to create review: ${error}`);
    }
  }
}

/**
 * Create meeting notes for completed sessions
 */
async function createMeetingNotes(
  prisma: PrismaClient,
  config: TherapyConfig,
  result: TherapyData
): Promise<void> {
  const completedMeetings = result.meetings.filter(m => m.status === 'COMPLETED');
  
  for (const meeting of completedMeetings) {
    // Create notes for most sessions
    if (Math.random() > config.sessionNotesRate) continue;

    try {
      const notes = await prisma.meetingNotes.create({
        data: {
          id: generateSessionId(),
          meetingId: meeting.id,
          notes: generateSessionNotes(),
          createdAt: new Date(meeting.endTime.getTime() + randomInt(10, 120) * 60 * 1000), // 10-120 minutes after session
        },
      });
      
      result.meetingNotes.push(notes);
    } catch (error) {
      console.log(`    ⚠️  Failed to create meeting notes: ${error}`);
    }
  }
}

/**
 * Utility functions for generating realistic content
 */
function generateSessionDescription(): string {
  const sessionTypes = [
    'Individual therapy session focusing on cognitive behavioral techniques',
    'Check-in session to review progress and adjust treatment goals',
    'Session dedicated to processing recent challenges and developing coping strategies',
    'Mindfulness and relaxation training session',
    'Session to review worksheet assignments and discuss insights',
  ];
  return randomChoice(sessionTypes);
}

function generateWorksheetInstructions(template: any): string {
  return `${template.description}\n\nEstimated time: ${template.estimatedDuration} minutes\n\nInstructions:\n1. Complete all sections thoughtfully and honestly\n2. Take your time - there are no right or wrong answers\n3. If you need clarification, please reach out before our next session\n4. Upload your completed worksheet by the due date`;
}

function generateWorksheetFeedback(): string {
  const feedbacks = [
    "Excellent work on this assignment! I can see you've put a lot of thought into your responses. The insights you've shared show real progress in your self-awareness.",
    "Thank you for completing this worksheet thoroughly. Your honesty in reflecting on your experiences will help us work together more effectively in our sessions.",
    "I appreciate the effort you put into this exercise. Some of your observations align perfectly with what we've been discussing in therapy. Let's explore these themes further in our next session.",
    "Good job on identifying those patterns in your thinking. This awareness is a crucial step in developing healthier coping strategies.",
    "Your responses show that you're actively engaging with the therapeutic process. I'm particularly impressed with your willingness to challenge your own assumptions.",
  ];
  return randomChoice(feedbacks);
}

function generateAssessmentResponses(): number[] {
  // Generate 201 random responses (0-4 scale typical for mental health assessments)
  const responses: number[] = [];
  for (let i = 0; i < 201; i++) {
    responses.push(randomInt(0, 4));
  }
  return responses;
}

function generateAssessmentScores(): any {
  return {
    anxiety_score: randomInt(0, 21),
    depression_score: randomInt(0, 27),
    stress_score: randomInt(0, 21),
    sleep_quality: randomInt(1, 5),
    social_support: randomInt(1, 5),
    coping_skills: randomInt(1, 5),
  };
}

function generateSeverityLevels(): any {
  return {
    anxiety: randomChoice(['minimal', 'mild', 'moderate', 'severe']),
    depression: randomChoice(['minimal', 'mild', 'moderate', 'severe']),
    stress: randomChoice(['low', 'moderate', 'high']),
  };
}

function generateAiEstimate(): any {
  return {
    primary_concerns: randomChoices(['anxiety', 'depression', 'stress', 'trauma', 'relationships'], randomInt(1, 3)),
    severity_overall: randomChoice(['low', 'moderate', 'high']),
    recommended_interventions: randomChoices(['CBT', 'DBT', 'mindfulness', 'medication_evaluation'], randomInt(1, 3)),
    confidence_score: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
  };
}


function generateRealistictRating(): number {
  // Weighted towards positive ratings (realistic for therapy)
  const weights = [1, 2, 5, 15, 25]; // Weights for ratings 1-5
  const random = Math.random() * weights.reduce((a, b) => a + b, 0);
  
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return i + 1;
    }
  }
  return 5; // Default to highest rating
}

function generateReviewComment(rating: number): string {
  const comments = {
    5: [
      "Dr. Thompson has been incredibly helpful in my journey. I feel heard and supported in every session.",
      "Excellent therapist! Very professional and caring. Would highly recommend.",
      "I've made significant progress with their guidance. Truly grateful for their expertise.",
      "Outstanding therapist who creates a safe space for healing and growth.",
    ],
    4: [
      "Very good therapist. I've learned a lot and feel more equipped to handle my challenges.",
      "Professional and knowledgeable. Sessions have been beneficial for my mental health.",
      "I appreciate their approach and have seen positive changes in my life.",
      "Good therapist who listens well and provides helpful insights.",
    ],
    3: [
      "Decent experience overall. Some sessions were more helpful than others.",
      "Professional service. I'm making some progress but it's been slow.",
      "Good therapist, though I sometimes feel like we're not quite clicking.",
    ],
    2: [
      "The approach didn't quite work for me, though they were professional.",
      "Had some helpful moments but overall didn't feel like the right fit.",
    ],
    1: [
      "Unfortunately, this wasn't the right therapeutic approach for my needs.",
    ],
  };
  
  const ratingComments = comments[rating as keyof typeof comments] || comments[3];
  return randomChoice(ratingComments);
}

function generateSessionNotes(): string {
  const noteTemplates = [
    "Client presented with increased anxiety this week. Worked on breathing techniques and identified triggers. Homework: practice 5-4-3-2-1 grounding technique daily.",
    "Good progress on depression symptoms. Client reported better sleep and increased activity levels. Continued work on cognitive restructuring. Next session: review thought record.",
    "Client processing recent stressful events well. Used session to develop action plan for upcoming challenges. Reviewed coping strategies and reinforced progress made.",
    "Focused on relationship dynamics and communication patterns. Client gained insights into attachment style. Assigned reading on healthy boundaries.",
    "Session dedicated to trauma processing using EMDR techniques. Client tolerated well with good bilateral stimulation response. Follow-up on integration next week.",
  ];
  return randomChoice(noteTemplates);
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateFileId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(daysAgo: number): Date {
  const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms);
}