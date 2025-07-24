#!/usr/bin/env node
// CLI interface for modular seeding system

import { runSeedingFromPhase, runSpecificPhase, showSeedingProgress, resetSeedingProgress } from './seed-orchestrator';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'from-phase': {
        const startPhase = parseInt(args[1]);
        const config = args.includes('--simple') ? 'simple' : 'comprehensive';
        const force = args.includes('--force');
        
        if (!startPhase || startPhase < 1 || startPhase > 12) {
          console.error('❌ Please provide a valid phase number (1-12)');
          console.log('Usage: npm run seed:from-phase <phase-number> [--simple] [--force]');
          process.exit(1);
        }
        
        await runSeedingFromPhase(startPhase, { config, force });
        break;
      }
      
      case 'phase': {
        const phaseNumber = parseInt(args[1]);
        const config = args.includes('--simple') ? 'simple' : 'comprehensive';
        const force = args.includes('--force');
        
        if (!phaseNumber || phaseNumber < 1 || phaseNumber > 12) {
          console.error('❌ Please provide a valid phase number (1-12)');
          console.log('Usage: npm run seed:phase <phase-number> [--simple] [--force]');
          process.exit(1);
        }
        
        await runSpecificPhase(phaseNumber, { config, force });
        break;
      }
      
      case 'progress': {
        const config = args.includes('--simple') ? 'simple' : 'comprehensive';
        await showSeedingProgress({ config });
        break;
      }
      
      case 'reset': {
        const config = args.includes('--simple') ? 'simple' : 'comprehensive';
        await resetSeedingProgress({ config });
        break;
      }
      
      default: {
        console.log('🌱 Modular Database Seeding CLI');
        console.log('===============================');
        console.log('');
        console.log('Commands:');
        console.log('  npm run seed:from-phase <N>   Resume seeding from phase N');
        console.log('  npm run seed:phase <N>        Run only phase N');
        console.log('  npm run seed:progress         Show current progress');
        console.log('  npm run seed:reset            Reset progress and start over');
        console.log('');
        console.log('Flags:');
        console.log('  --simple                      Use simple/development mode');
        console.log('  --force                       Force re-run even if completed');
        console.log('');
        console.log('Examples:');
        console.log('  npm run seed:from-phase 1     Start from beginning');
        console.log('  npm run seed:from-phase 9     Resume from phase 9 (where error occurred)');
        console.log('  npm run seed:phase 8 --force  Re-run phase 8 only');
        console.log('  npm run seed:progress         Check current status');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('❌ CLI error:', error);
    process.exit(1);
  }
}

main();