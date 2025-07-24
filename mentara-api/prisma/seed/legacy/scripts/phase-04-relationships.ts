// Phase 4: Client-Therapist Relationships
// Creates relationships between clients and therapists

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PhaseResult } from './progress-tracker';
import { SEED_CONFIG } from '../config';

interface RelationshipsPhaseData {
  relationships: any[];
}

export async function runPhase04Relationships(
  prisma: PrismaClient,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`🤝 PHASE 4: Creating client-therapist relationships (${config} mode)...`);

  try {
    const { clients, therapists } = usersData;

    if (!clients?.length || !therapists?.length) {
      return {
        success: false,
        message: 'Missing required data from previous phases (clients or therapists)',
      };
    }

    // Check if relationships already exist (idempotent check)
    const existingRelationshipsCount = await prisma.clientTherapist.count();
    if (existingRelationshipsCount > 0) {
      console.log(`⏭️ Found ${existingRelationshipsCount} existing relationships, skipping phase`);
      
      // Return existing data
      const existingRelationships = await prisma.clientTherapist.findMany({
        include: {
          client: { include: { user: true } },
          therapist: { include: { user: true } },
        },
      });

      return {
        success: true,
        message: `Found ${existingRelationshipsCount} existing relationships`,
        skipped: true,
        data: { relationships: existingRelationships },
      };
    }

    const seedConfig = SEED_CONFIG;
    const relationships: any[] = [];
    
    // Assign therapists to clients based on configuration ratio
    const assignmentCount = Math.floor(
      clients.length * seedConfig.RELATIONSHIPS.CLIENT_THERAPIST_RATIO,
    );
    const clientsToAssign = faker.helpers.arrayElements(clients, assignmentCount);

    console.log(`📊 Assigning ${assignmentCount} out of ${clients.length} clients to ${therapists.length} therapists`);

    for (const clientData of clientsToAssign) {
      const therapistData = faker.helpers.arrayElement(therapists);
      
      try {
        const relationship = await prisma.clientTherapist.create({
          data: {
            clientId: (clientData as any).user.id,
            therapistId: (therapistData as any).user.id,
            assignedAt: faker.date.past({ years: 1 }),
          },
          include: {
            client: { include: { user: true } },
            therapist: { include: { user: true } },
          },
        });
        
        // Store the relationship record directly (not wrapped in an object)
        relationships.push(relationship);
        console.log(
          `✅ Assigned ${(clientData as any).user.firstName} to therapist ${(therapistData as any).user.firstName}`,
        );
      } catch (error) {
        // Skip if relationship already exists, but try to find and include it
        console.log(`⏭️ Relationship already exists for client ${(clientData as any).user.firstName}`);
        try {
          const existingRelationship = await prisma.clientTherapist.findFirst({
            where: {
              clientId: (clientData as any).user.id,
              therapistId: (therapistData as any).user.id,
            },
            include: {
              client: { include: { user: true } },
              therapist: { include: { user: true } },
            },
          });
          if (existingRelationship) {
            relationships.push(existingRelationship);
          }
        } catch (findError) {
          console.warn(`⚠️ Could not find existing relationship for client ${(clientData as any).user.firstName}`);
        }
      }
    }

    console.log(`✅ Phase 4 completed: Created ${relationships.length} client-therapist relationships`);
    console.log(`📊 Relationships data structure validation: ${relationships.length > 0 ? 'VALID' : 'EMPTY'}`);
    
    if (relationships.length > 0) {
      console.log(`🔍 Sample relationship structure:`, {
        id: relationships[0].id,
        clientId: relationships[0].clientId,
        therapistId: relationships[0].therapistId,
        hasClientData: !!relationships[0].client,
        hasTherapistData: !!relationships[0].therapist,
      });
    }

    return {
      success: true,
      message: `Created ${relationships.length} relationships successfully`,
      data: { relationships },
    };

  } catch (error) {
    console.error('❌ Phase 4 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}