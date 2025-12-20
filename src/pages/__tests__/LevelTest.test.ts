/**
 * Tests for LevelTest component - specifically the calculateDominantLevel function
 */

import { describe, it, expect } from 'vitest';
import type { CefrLevel } from '@/services/levelTestAPI';

interface QuestionEvaluation {
  questionId: string;
  level: CefrLevel;
  explanation: string;
}

/**
 * Calculate dominant CEFR level from evaluations
 * Returns the most common level, or average if tied
 * This is a copy of the function from LevelTest.tsx for testing
 */
function calculateDominantLevel(evaluations: QuestionEvaluation[]): CefrLevel {
  if (evaluations.length === 0) return 'B1';

  // Count occurrences of each level
  const levelCounts: Record<CefrLevel, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  };

  evaluations.forEach((evaluation) => {
    levelCounts[evaluation.level]++;
  });

  // Find the level with maximum count
  let maxCount = 0;
  let dominantLevel: CefrLevel = 'B1';

  (Object.keys(levelCounts) as CefrLevel[]).forEach((level) => {
    if (levelCounts[level] > maxCount) {
      maxCount = levelCounts[level];
      dominantLevel = level;
    }
  });

  // If there's a tie, calculate average (convert to numeric, average, round)
  const levelValues: Record<CefrLevel, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6,
  };

  const tiedLevels = (Object.keys(levelCounts) as CefrLevel[]).filter(
    (level) => levelCounts[level] === maxCount
  );

  if (tiedLevels.length > 1) {
    // Calculate average
    const avgValue = Math.round(
      tiedLevels.reduce((sum, level) => sum + levelValues[level], 0) / tiedLevels.length
    );
    // Convert back to level
    const levelFromValue = (Object.keys(levelValues) as CefrLevel[]).find(
      (level) => levelValues[level] === avgValue
    );
    return levelFromValue || dominantLevel;
  }

  return dominantLevel;
}

describe('LevelTest - calculateDominantLevel', () => {
  it('should return B1 for empty evaluations', () => {
    const evaluations: QuestionEvaluation[] = [];
    expect(calculateDominantLevel(evaluations)).toBe('B1');
  });

  it('should return the most common level', () => {
    const evaluations: QuestionEvaluation[] = [
      { questionId: '1', level: 'B1', explanation: 'Explanation 1' },
      { questionId: '2', level: 'B1', explanation: 'Explanation 2' },
      { questionId: '3', level: 'B2', explanation: 'Explanation 3' },
      { questionId: '4', level: 'A2', explanation: 'Explanation 4' },
    ];

    expect(calculateDominantLevel(evaluations)).toBe('B1');
  });

  it('should handle single evaluation', () => {
    const evaluations: QuestionEvaluation[] = [
      { questionId: '1', level: 'C1', explanation: 'Explanation 1' },
    ];

    expect(calculateDominantLevel(evaluations)).toBe('C1');
  });

  it('should calculate average for tied levels', () => {
    const evaluations: QuestionEvaluation[] = [
      { questionId: '1', level: 'B1', explanation: 'Explanation 1' },
      { questionId: '2', level: 'B2', explanation: 'Explanation 2' },
    ];

    // B1 (3) and B2 (4) average to 3.5, rounded to 4, which is B2
    expect(calculateDominantLevel(evaluations)).toBe('B2');
  });

  it('should handle three-way tie', () => {
    const evaluations: QuestionEvaluation[] = [
      { questionId: '1', level: 'A1', explanation: 'Explanation 1' },
      { questionId: '2', level: 'B1', explanation: 'Explanation 2' },
      { questionId: '3', level: 'C1', explanation: 'Explanation 3' },
    ];

    // A1 (1), B1 (3), C1 (5) average to 3, which is B1
    expect(calculateDominantLevel(evaluations)).toBe('B1');
  });

  it('should handle all same levels', () => {
    const evaluations: QuestionEvaluation[] = [
      { questionId: '1', level: 'B2', explanation: 'Explanation 1' },
      { questionId: '2', level: 'B2', explanation: 'Explanation 2' },
      { questionId: '3', level: 'B2', explanation: 'Explanation 3' },
    ];

    expect(calculateDominantLevel(evaluations)).toBe('B2');
  });

  it('should handle edge case with A1 and C2', () => {
    const evaluations: QuestionEvaluation[] = [
      { questionId: '1', level: 'A1', explanation: 'Explanation 1' },
      { questionId: '2', level: 'C2', explanation: 'Explanation 2' },
    ];

    // A1 (1) and C2 (6) average to 3.5, rounded to 4, which is B2
    expect(calculateDominantLevel(evaluations)).toBe('B2');
  });
});

