/**
 * Deterministic Random Generator
 *
 * Creates a seeded random generator for consistent test data
 * Same seed always produces same sequence of random numbers
 */

import * as crypto from 'crypto';

export class SeededRandom {
  private seed: number;
  private current: number;

  constructor(seed: string) {
    // Convert string seed to number using MD5 hash
    const hash = crypto.createHash('md5').update(seed).digest('hex');
    this.seed = parseInt(hash.slice(0, 8), 16);
    this.current = this.seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // Simple LCG (Linear Congruential Generator)
    this.current = (this.current * 1664525 + 1013904223) % 0x100000000;
    return this.current / 0x100000000;
  }

  /**
   * Generate random integer between 0 and max (exclusive)
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextIntRange(min: number, max: number): number {
    return min + this.nextInt(max - min + 1);
  }

  /**
   * Pick random item from array
   */
  pickRandom<T>(array: T[]): T {
    return array[this.nextInt(array.length)];
  }

  /**
   * Shuffle array deterministically
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Create seeded random generator
 */
export function createSeededRandom(
  entityId: string,
  context: string,
): SeededRandom {
  return new SeededRandom(`${entityId}-${context}`);
}
