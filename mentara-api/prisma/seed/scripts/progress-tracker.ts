// Progress Tracker for Modular Database Seeding
// Tracks completion status of each seeding phase for resume capability

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface PhaseResult {
  success: boolean;
  message: string;
  data?: any;
  skipped?: boolean;
  duration?: number;
}

export interface SeedProgress {
  startedAt: string;
  lastUpdatedAt: string;
  lastPhase: number;
  completedPhases: number[];
  failedPhases: { phase: number; error: string; timestamp: string }[];
  metadata: Record<string, any>;
  config: 'comprehensive' | 'simple';
}

export class ProgressTracker {
  private progressFilePath: string;
  private progress: SeedProgress;

  constructor(seedType: 'comprehensive' | 'simple' = 'comprehensive') {
    this.progressFilePath = join(process.cwd(), '.seed-progress.json');
    this.progress = this.loadProgress();
    
    // Initialize if new or different config
    if (!this.progress.startedAt || this.progress.config !== seedType) {
      this.resetProgress(seedType);
    }
  }

  private loadProgress(): SeedProgress {
    if (existsSync(this.progressFilePath)) {
      try {
        const content = readFileSync(this.progressFilePath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️ Could not load progress file, starting fresh');
      }
    }

    return this.createEmptyProgress();
  }

  private createEmptyProgress(config: 'comprehensive' | 'simple' = 'comprehensive'): SeedProgress {
    return {
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lastPhase: 0,
      completedPhases: [],
      failedPhases: [],
      metadata: {},
      config,
    };
  }

  private saveProgress(): void {
    this.progress.lastUpdatedAt = new Date().toISOString();
    writeFileSync(this.progressFilePath, JSON.stringify(this.progress, null, 2));
  }

  public resetProgress(config: 'comprehensive' | 'simple' = 'comprehensive'): void {
    this.progress = this.createEmptyProgress(config);
    this.saveProgress();
    console.log(`🔄 Reset seeding progress for ${config} mode`);
  }

  public isPhaseCompleted(phaseNumber: number): boolean {
    return this.progress.completedPhases.includes(phaseNumber);
  }

  public markPhaseStarted(phaseNumber: number): void {
    this.progress.lastPhase = phaseNumber;
    // Remove from failed phases if it was there
    this.progress.failedPhases = this.progress.failedPhases.filter(
      f => f.phase !== phaseNumber
    );
    this.saveProgress();
  }

  public markPhaseCompleted(phaseNumber: number, result: PhaseResult): void {
    if (!this.progress.completedPhases.includes(phaseNumber)) {
      this.progress.completedPhases.push(phaseNumber);
    }
    
    // Store result metadata if provided
    if (result.data) {
      this.progress.metadata[`phase_${phaseNumber}`] = result.data;
    }
    
    this.saveProgress();
    
    if (result.skipped) {
      console.log(`⏭️ Phase ${phaseNumber}: ${result.message}`);
    } else {
      console.log(`✅ Phase ${phaseNumber}: ${result.message}`);
    }
  }

  public markPhaseFailed(phaseNumber: number, error: string): void {
    const failedPhase = {
      phase: phaseNumber,
      error,
      timestamp: new Date().toISOString(),
    };
    
    // Remove existing failed entry for this phase
    this.progress.failedPhases = this.progress.failedPhases.filter(
      f => f.phase !== phaseNumber
    );
    
    // Add new failed entry
    this.progress.failedPhases.push(failedPhase);
    this.saveProgress();
    
    console.error(`❌ Phase ${phaseNumber} failed: ${error}`);
  }

  public getNextPhaseToRun(): number | null {
    const totalPhases = 12; // Total number of phases
    
    for (let phase = 1; phase <= totalPhases; phase++) {
      if (!this.isPhaseCompleted(phase)) {
        return phase;
      }
    }
    
    return null; // All phases completed
  }

  public getProgress(): SeedProgress {
    return { ...this.progress };
  }

  public getCompletionPercentage(): number {
    const totalPhases = 12;
    return Math.round((this.progress.completedPhases.length / totalPhases) * 100);
  }

  public printStatus(): void {
    const progress = this.getProgress();
    const percentage = this.getCompletionPercentage();
    const nextPhase = this.getNextPhaseToRun();

    console.log('\n📊 Seeding Progress Status');
    console.log('========================');
    console.log(`📈 Overall Progress: ${percentage}% (${progress.completedPhases.length}/12 phases)`);
    console.log(`🚀 Started: ${new Date(progress.startedAt).toLocaleString()}`);
    console.log(`⏰ Last Updated: ${new Date(progress.lastUpdatedAt).toLocaleString()}`);
    console.log(`🔧 Mode: ${progress.config}`);
    
    if (progress.completedPhases.length > 0) {
      console.log(`✅ Completed Phases: [${progress.completedPhases.sort((a, b) => a - b).join(', ')}]`);
    }
    
    if (progress.failedPhases.length > 0) {
      console.log('❌ Failed Phases:');
      progress.failedPhases.forEach(failed => {
        console.log(`   Phase ${failed.phase}: ${failed.error}`);
      });
    }
    
    if (nextPhase) {
      console.log(`➡️  Next Phase: ${nextPhase}`);
    } else {
      console.log('🎉 All phases completed!');
    }
    
    console.log('========================\n');
  }

  public getPhaseMetadata(phaseNumber: number): any {
    return this.progress.metadata[`phase_${phaseNumber}`];
  }

  public setPhaseMetadata(phaseNumber: number, metadata: any): void {
    this.progress.metadata[`phase_${phaseNumber}`] = metadata;
    this.saveProgress();
  }

  public canRunPhase(phaseNumber: number): boolean {
    // Phase 1 can always run
    if (phaseNumber === 1) return true;
    
    // All other phases require the previous phase to be completed
    return this.isPhaseCompleted(phaseNumber - 1);
  }

  public getPhaseDescription(phaseNumber: number): string {
    const descriptions = {
      1: 'Users (clients, therapists, moderators, admins)',
      2: 'Communities',
      3: 'Community Memberships & Moderator Assignments',
      4: 'Client-Therapist Relationships',
      5: 'Pre-assessments & Mental Health Evaluations',
      6: 'Meetings, Notes & Payment Methods',
      7: 'Payment Transactions',
      8: 'Community Content (posts, comments, reactions)',
      9: 'Messaging System (conversations, messages)',
      10: 'Worksheets & Therapy Materials',
      11: 'Therapist Reviews & Ratings',
      12: 'Notifications & Device Tokens'
    };
    
    return descriptions[phaseNumber as keyof typeof descriptions] || `Phase ${phaseNumber}`;
  }
}

export function createProgressTracker(seedType: 'comprehensive' | 'simple' = 'comprehensive'): ProgressTracker {
  return new ProgressTracker(seedType);
}