// Seed Orchestrator - Main Controller for Modular Database Seeding
// Handles running individual phases, resume functionality, and error management

import { PrismaClient } from '@prisma/client';
import { ProgressTracker, PhaseResult, createProgressTracker } from './progress-tracker';

export interface SeedOrchestratorOptions {
  startPhase?: number;
  endPhase?: number;
  targetPhase?: number;
  force?: boolean;
  config?: 'comprehensive' | 'simple';
}

export class SeedOrchestrator {
  private prisma: PrismaClient;
  private progressTracker: ProgressTracker;
  private phaseRunners: Map<number, () => Promise<PhaseResult>>;

  constructor(options: SeedOrchestratorOptions = {}) {
    this.prisma = new PrismaClient();
    this.progressTracker = createProgressTracker(options.config || 'comprehensive');
    this.phaseRunners = new Map();
    
    this.registerPhaseRunners();
  }

  private registerPhaseRunners(): void {
    // Phase runners will be registered here as we create them
    // For now, we'll create placeholders that import the actual phase functions
    
    this.phaseRunners.set(1, async () => {
      const { runPhase01Users } = await import('./phase-01-users');
      return runPhase01Users(this.prisma, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(2, async () => {
      const { runPhase02Communities } = await import('./phase-02-communities');
      return runPhase02Communities(this.prisma, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(3, async () => {
      const { runPhase03Memberships } = await import('./phase-03-memberships');
      const usersData = this.progressTracker.getPhaseMetadata(1);
      const communitiesData = this.progressTracker.getPhaseMetadata(2);
      return runPhase03Memberships(this.prisma, usersData, communitiesData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(4, async () => {
      const { runPhase04Relationships } = await import('./phase-04-relationships');
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase04Relationships(this.prisma, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(5, async () => {
      const { runPhase05Assessments } = await import('./phase-05-assessments');
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase05Assessments(this.prisma, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(6, async () => {
      const { runPhase06Meetings } = await import('./phase-06-meetings');
      const relationshipsData = this.progressTracker.getPhaseMetadata(4);
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase06Meetings(this.prisma, relationshipsData, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(7, async () => {
      const { runPhase07Payments } = await import('./phase-07-payments');
      const meetingsData = this.progressTracker.getPhaseMetadata(6);
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase07Payments(this.prisma, meetingsData, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(8, async () => {
      const { runPhase08Content } = await import('./phase-08-content');
      const communitiesData = this.progressTracker.getPhaseMetadata(2);
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase08Content(this.prisma, communitiesData, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(9, async () => {
      const { runPhase09Messaging } = await import('./phase-09-messaging');
      const relationshipsData = this.progressTracker.getPhaseMetadata(4);
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase09Messaging(this.prisma, relationshipsData, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(10, async () => {
      const { runPhase10Worksheets } = await import('./phase-10-worksheets');
      const relationshipsData = this.progressTracker.getPhaseMetadata(4);
      return runPhase10Worksheets(this.prisma, relationshipsData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(11, async () => {
      const { runPhase11Reviews } = await import('./phase-11-reviews');
      const relationshipsData = this.progressTracker.getPhaseMetadata(4);
      const meetingsData = this.progressTracker.getPhaseMetadata(6);
      const usersData = this.progressTracker.getPhaseMetadata(1);
      return runPhase11Reviews(this.prisma, relationshipsData, meetingsData, usersData, this.progressTracker.getProgress().config);
    });

    this.phaseRunners.set(12, async () => {
      const { runPhase12Notifications } = await import('./phase-12-notifications');
      const usersData = this.progressTracker.getPhaseMetadata(1);
      const relationshipsData = this.progressTracker.getPhaseMetadata(4);
      const meetingsData = this.progressTracker.getPhaseMetadata(6);
      const worksheetsData = this.progressTracker.getPhaseMetadata(10);
      const messagingData = this.progressTracker.getPhaseMetadata(9);
      return runPhase12Notifications(this.prisma, usersData, relationshipsData, meetingsData, worksheetsData, messagingData, this.progressTracker.getProgress().config);
    });
  }

  public async runPhase(phaseNumber: number, force: boolean = false): Promise<PhaseResult> {
    const phaseDescription = this.progressTracker.getPhaseDescription(phaseNumber);
    
    console.log(`\n📍 PHASE ${phaseNumber}: ${phaseDescription}`);
    
    // Check if phase can run
    if (!this.progressTracker.canRunPhase(phaseNumber) && !force) {
      return {
        success: false,
        message: `Cannot run phase ${phaseNumber}: previous phases not completed`,
      };
    }

    // Check if already completed and not forcing
    if (this.progressTracker.isPhaseCompleted(phaseNumber) && !force) {
      return {
        success: true,
        message: 'Phase already completed',
        skipped: true,
      };
    }

    const phaseRunner = this.phaseRunners.get(phaseNumber);
    if (!phaseRunner) {
      return {
        success: false,
        message: `No runner found for phase ${phaseNumber}`,
      };
    }

    this.progressTracker.markPhaseStarted(phaseNumber);

    try {
      const startTime = Date.now();
      const result = await phaseRunner();
      const duration = Date.now() - startTime;
      
      result.duration = duration;

      if (result.success) {
        this.progressTracker.markPhaseCompleted(phaseNumber, result);
      } else {
        this.progressTracker.markPhaseFailed(phaseNumber, result.message);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.progressTracker.markPhaseFailed(phaseNumber, errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  public async runFromPhase(startPhase: number, options: { force?: boolean; endPhase?: number } = {}): Promise<void> {
    const { force = false, endPhase = 12 } = options;
    
    console.log(`🚀 Starting seeding from phase ${startPhase} to phase ${endPhase}`);
    console.log(`🔧 Mode: ${this.progressTracker.getProgress().config}`);
    
    for (let phase = startPhase; phase <= endPhase; phase++) {
      const result = await this.runPhase(phase, force);
      
      if (!result.success) {
        console.error(`\n❌ Seeding stopped at phase ${phase}: ${result.message}`);
        console.log(`\n💡 To resume from this phase, run:`);
        console.log(`   npm run seed:from-phase ${phase}`);
        console.log(`\n💡 To retry this phase specifically, run:`);
        console.log(`   npm run seed:phase ${phase} --force`);
        break;
      }
      
      if (!result.skipped && result.duration) {
        console.log(`⏱️  Phase ${phase} completed in ${(result.duration / 1000).toFixed(2)}s`);
      }
    }

    // Check if all phases completed
    const nextPhase = this.progressTracker.getNextPhaseToRun();
    if (!nextPhase || nextPhase > endPhase) {
      console.log('\n🎉 All phases completed successfully!');
      this.progressTracker.printStatus();
    }
  }

  public async runSpecificPhase(phaseNumber: number, force: boolean = false): Promise<void> {
    console.log(`🎯 Running specific phase ${phaseNumber}`);
    
    const result = await this.runPhase(phaseNumber, force);
    
    if (result.success) {
      console.log(`✅ Phase ${phaseNumber} completed successfully`);
      if (result.duration) {
        console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
      }
    } else {
      console.error(`❌ Phase ${phaseNumber} failed: ${result.message}`);
    }
  }

  public printProgress(): void {
    this.progressTracker.printStatus();
  }

  public resetProgress(): void {
    this.progressTracker.resetProgress(this.progressTracker.getProgress().config);
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// CLI Interface Functions
export async function runSeedingFromPhase(
  startPhase: number,
  options: { endPhase?: number; force?: boolean; config?: 'comprehensive' | 'simple' } = {}
): Promise<void> {
  const orchestrator = new SeedOrchestrator(options);
  
  try {
    await orchestrator.runFromPhase(startPhase, options);
  } catch (error) {
    console.error('❌ Seeding orchestrator error:', error);
    throw error;
  } finally {
    await orchestrator.disconnect();
  }
}

export async function runSpecificPhase(
  phaseNumber: number,
  options: { force?: boolean; config?: 'comprehensive' | 'simple' } = {}
): Promise<void> {
  const orchestrator = new SeedOrchestrator(options);
  
  try {
    await orchestrator.runSpecificPhase(phaseNumber, options.force || false);
  } catch (error) {
    console.error('❌ Seeding orchestrator error:', error);
    throw error;
  } finally {
    await orchestrator.disconnect();
  }
}

export async function showSeedingProgress(
  options: { config?: 'comprehensive' | 'simple' } = {}
): Promise<void> {
  const orchestrator = new SeedOrchestrator(options);
  
  try {
    orchestrator.printProgress();
  } finally {
    await orchestrator.disconnect();
  }
}

export async function resetSeedingProgress(
  options: { config?: 'comprehensive' | 'simple' } = {}
): Promise<void> {
  const orchestrator = new SeedOrchestrator(options);
  
  try {
    orchestrator.resetProgress();
    console.log('🔄 Seeding progress reset successfully');
  } finally {
    await orchestrator.disconnect();
  }
}