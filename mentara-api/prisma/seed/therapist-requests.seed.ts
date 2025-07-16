// Therapist Requests Seed Module
// Handles creation of client requests to therapists

import { PrismaClient, ClientRequestStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedTherapistRequests(
  prisma: PrismaClient,
  clients: any[],
  therapists: any[],
  existingRelationships: any[]
) {
  console.log('🤝 Creating client-therapist requests...');

  const requests: any[] = [];

  // Get existing relationship pairs to avoid creating duplicate requests
  const existingPairs = new Set(
    existingRelationships.map(rel => `${rel.client.user.id}-${rel.therapist.user.id}`)
  );

  // Create requests from clients who don't have active relationships with specific therapists
  const totalRequests = Math.min(50, clients.length * 2); // Up to 2 requests per client
  
  for (let i = 0; i < totalRequests; i++) {
    try {
      const client = faker.helpers.arrayElement(clients);
      const therapist = faker.helpers.arrayElement(therapists);
      
      // Check if this client-therapist pair already has a relationship or request
      const pairKey = `${client.user.id}-${therapist.user.id}`;
      if (existingPairs.has(pairKey)) {
        continue; // Skip this pair
      }

      // Check if request already exists for this pair
      const existingRequest = await prisma.clientTherapistRequest.findUnique({
        where: {
          clientId_therapistId: {
            clientId: client.user.id,
            therapistId: therapist.user.id,
          },
        },
      });

      if (existingRequest) {
        continue; // Skip if request already exists
      }

      // Generate request timing
      const requestedAt = faker.date.past({ years: 0.5 });
      const expiresAt = new Date(requestedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after requested
      
      // Determine status based on timing and random factors
      const now = new Date();
      let status: ClientRequestStatus;
      let respondedAt: Date | null = null;
      let therapistResponse: string | null = null;

      if (expiresAt < now) {
        // Request has expired
        if (faker.datatype.boolean({ probability: 0.3 })) {
          status = ClientRequestStatus.EXPIRED;
        } else {
          // Therapist responded before expiration
          status = faker.helpers.arrayElement([ClientRequestStatus.ACCEPTED, ClientRequestStatus.DECLINED, ClientRequestStatus.DECLINED]);
          respondedAt = faker.date.between({ from: requestedAt, to: expiresAt });
          therapistResponse = generateTherapistResponse(status);
        }
      } else {
        // Request is still active
        if (faker.datatype.boolean({ probability: 0.7 })) {
          status = ClientRequestStatus.PENDING;
        } else {
          // Quick response
          status = faker.helpers.arrayElement([ClientRequestStatus.ACCEPTED, ClientRequestStatus.DECLINED]);
          respondedAt = faker.date.between({ from: requestedAt, to: now });
          therapistResponse = generateTherapistResponse(status);
        }
      }

      // Generate priority (mostly normal, some high for urgent cases)
      const priority = faker.helpers.arrayElement([
        'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HIGH', 'LOW'
      ]);

      // Generate client message
      const clientMessage = generateClientMessage(client.user, therapist.user, priority);

      // Generate match score and recommendation rank
      const matchScore = faker.number.float({ min: 0.6, max: 0.95 });
      const recommendationRank = faker.number.int({ min: 1, max: 10 });

      const request = await prisma.clientTherapistRequest.create({
        data: {
          clientId: client.user.id,
          therapistId: therapist.user.id,
          status,
          priority,
          requestedAt,
          respondedAt,
          expiresAt,
          clientMessage,
          therapistResponse,
          recommendationRank,
          matchScore,
        },
      });
      requests.push(request);

      // Mark this pair as used
      existingPairs.add(pairKey);

      console.log(
        `✅ Created ${status} request from ${client.user.firstName} to ${therapist.user.firstName} (${priority} priority)`
      );
    } catch (error) {
      // Continue with next request if this one fails
      console.warn(`Failed to create request ${i + 1}:`, error instanceof Error ? error.message : String(error));
    }
  }

  // Create some cancelled/withdrawn requests
  const cancelledCount = Math.min(5, Math.floor(requests.length * 0.1));
  for (let i = 0; i < cancelledCount; i++) {
    try {
      const client = faker.helpers.arrayElement(clients);
      const therapist = faker.helpers.arrayElement(therapists);
      const pairKey = `${client.user.id}-${therapist.user.id}`;
      
      if (existingPairs.has(pairKey)) {
        continue;
      }

      const requestedAt = faker.date.past({ years: 0.25 });
      const cancelledAt = faker.date.between({
        from: requestedAt,
        to: new Date(requestedAt.getTime() + 3 * 24 * 60 * 60 * 1000), // Cancelled within 3 days
      });

      const status = faker.helpers.arrayElement([ClientRequestStatus.CANCELLED, ClientRequestStatus.CANCELLED]);
      
      const request = await prisma.clientTherapistRequest.create({
        data: {
          clientId: client.user.id,
          therapistId: therapist.user.id,
          status,
          priority: 'NORMAL',
          requestedAt,
          respondedAt: null,
          expiresAt: new Date(requestedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
          clientMessage: generateClientMessage(client.user, therapist.user, 'NORMAL'),
          therapistResponse: null,
          recommendationRank: faker.number.int({ min: 1, max: 5 }),
          matchScore: faker.number.float({ min: 0.7, max: 0.9 }),
          updatedAt: cancelledAt,
        },
      });
      requests.push(request);
      existingPairs.add(pairKey);
    } catch (error) {
      // Continue with next request if this one fails
    }
  }

  // Calculate request statistics
  const requestStats = calculateRequestStats(requests);

  console.log(`📊 Therapist request summary:`);
  console.log(`   🤝 Total requests: ${requests.length}`);
  console.log(`   ⏳ Pending: ${requests.filter(r => r.status === 'PENDING').length}`);
  console.log(`   ✅ Accepted: ${requests.filter(r => r.status === ClientRequestStatus.ACCEPTED).length}`);
  console.log(`   ❌ Declined: ${requests.filter(r => r.status === ClientRequestStatus.DECLINED).length}`);
  console.log(`   ⏰ Expired: ${requests.filter(r => r.status === ClientRequestStatus.EXPIRED).length}`);
  console.log(`   🚫 Cancelled: ${requests.filter(r => r.status === ClientRequestStatus.CANCELLED).length}`);
  console.log(`   ⏸️ Pending: ${requests.filter(r => r.status === ClientRequestStatus.PENDING).length}`);
  console.log(`   🔥 High priority: ${requests.filter(r => r.priority === 'HIGH').length}`);
  console.log(`   📈 Average match score: ${requestStats.averageMatchScore.toFixed(2)}`);
  console.log(`   🎯 Average recommendation rank: ${requestStats.averageRank.toFixed(1)}`);

  return requests;
}

function generateClientMessage(client: any, therapist: any, priority: string): string {
  const urgentMessages = [
    `Hi Dr. ${therapist.lastName}, I'm reaching out because I'm going through a particularly difficult time right now and could really use professional support. Your expertise in anxiety and depression aligns perfectly with what I'm experiencing. I would be grateful for the opportunity to work with you.`,
    `Hello ${therapist.firstName}, I was referred to you by a friend who had great success with your therapy approach. I'm dealing with some urgent mental health concerns and would appreciate the chance to schedule a consultation with you as soon as possible.`,
    `Dr. ${therapist.lastName}, I've been struggling with severe anxiety that's affecting my daily life and work. After reviewing your profile and approach to treatment, I believe you would be an excellent fit for helping me develop better coping strategies. I'm hoping we can connect soon.`,
  ];

  const normalMessages = [
    `Hello ${therapist.firstName}, I came across your profile while looking for a therapist who specializes in cognitive behavioral therapy. Your approach and experience seem like they would be a great match for what I'm looking for in my mental health journey.`,
    `Hi Dr. ${therapist.lastName}, I'm interested in beginning therapy to work on some personal growth and mental health goals. Your expertise in mindfulness-based approaches really resonates with me, and I'd love the opportunity to work together.`,
    `Hello ${therapist.firstName}, I've been dealing with some stress and anxiety lately and think it would be beneficial to work with a professional. Your background and treatment philosophy seem well-aligned with what I'm seeking in a therapist.`,
    `Hi Dr. ${therapist.lastName}, I'm looking for a therapist to help me work through some relationship and communication challenges. Your experience in couples and individual therapy makes me think you'd be a great fit for my needs.`,
    `Hello ${therapist.firstName}, I've been considering therapy for a while now and finally feel ready to take that step. Your approach to treatment and the positive reviews from other clients give me confidence that we could work well together.`,
    `Hi Dr. ${therapist.lastName}, I'm seeking support for managing work-life balance and stress. Your background in helping professionals with similar challenges makes me think you'd be an excellent therapist for my situation.`,
  ];

  const lowPriorityMessages = [
    `Hi ${therapist.firstName}, I'm exploring therapy options and your profile caught my attention. I'm not in any urgent need, but I'd be interested in discussing the possibility of working together when your schedule allows.`,
    `Hello Dr. ${therapist.lastName}, I'm considering starting therapy for some personal development goals. I'd appreciate the opportunity to chat about your approach and see if we might be a good therapeutic match.`,
    `Hi ${therapist.firstName}, I'm looking for a therapist for ongoing mental health maintenance and personal growth. Your approach seems like it could be helpful for my long-term wellness goals.`,
  ];

  if (priority === 'HIGH' || priority === 'URGENT') {
    return faker.helpers.arrayElement(urgentMessages);
  } else if (priority === 'LOW') {
    return faker.helpers.arrayElement(lowPriorityMessages);
  } else {
    return faker.helpers.arrayElement(normalMessages);
  }
}

function generateTherapistResponse(status: ClientRequestStatus): string | null {
  if (status === ClientRequestStatus.ACCEPTED) {
    return faker.helpers.arrayElement([
      `Thank you for reaching out. I'd be happy to work with you. Based on your message, I believe my therapeutic approach could be beneficial for your situation. I have availability this week and would like to schedule an initial consultation to discuss your goals and how we can work together.`,
      `I appreciate you taking the time to contact me. Your description of your current challenges aligns well with my areas of expertise, and I'm confident we can make good progress together. I have openings in my schedule and would be glad to arrange our first session.`,
      `Thank you for your thoughtful message. I'm pleased to accept you as a client. I have experience helping individuals with similar concerns and believe we can work effectively together. Let's schedule an initial session to get started on your therapeutic journey.`,
      `I'm glad you reached out, and I'd be honored to support you through this process. Your goals and my therapeutic approach seem well-matched. I have availability for new clients and would like to schedule an intake session to begin our work together.`,
      `Thank you for considering me as your therapist. Based on what you've shared, I believe I can provide the support and guidance you're seeking. I'm accepting new clients and would like to arrange an initial consultation to discuss your needs and treatment goals.`,
    ]);
  } else if (status === ClientRequestStatus.DECLINED) {
    return faker.helpers.arrayElement([
      `Thank you for reaching out. Unfortunately, my current caseload is full and I'm not able to take on new clients at this time. I would recommend reaching out to other qualified therapists who may have availability and could provide the support you're seeking.`,
      `I appreciate your interest in working with me. While your situation sounds like something I typically work with, I currently don't have capacity for new clients. I'd suggest exploring other therapists with similar specializations who may be better able to accommodate your timeline.`,
      `Thank you for your message. After reviewing your needs, I don't feel that my current therapeutic approach and specialization would be the best fit for your specific situation. I'd recommend finding a therapist whose expertise more closely aligns with your particular concerns.`,
      `I appreciate you taking the time to contact me. Unfortunately, due to my current client load and scheduling constraints, I'm not able to take on new clients at this time. I encourage you to continue your search for a therapist who can provide the timely support you deserve.`,
      `Thank you for considering me as your therapist. While I understand your concerns are important, I don't currently have the availability to provide the level of care and attention your situation requires. I'd recommend connecting with another qualified professional who can better accommodate your needs.`,
    ]);
  }

  return null;
}

function calculateRequestStats(requests: any[]) {
  const validRequests = requests.filter(r => r.matchScore !== null);
  const totalMatchScore = validRequests.reduce((sum, request) => sum + request.matchScore, 0);
  const averageMatchScore = validRequests.length > 0 ? totalMatchScore / validRequests.length : 0;

  const validRanks = requests.filter(r => r.recommendationRank !== null);
  const totalRank = validRanks.reduce((sum, request) => sum + request.recommendationRank, 0);
  const averageRank = validRanks.length > 0 ? totalRank / validRanks.length : 0;

  return {
    averageMatchScore,
    averageRank,
    totalRequests: requests.length,
    validMatchScores: validRequests.length,
  };
}