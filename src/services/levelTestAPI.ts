/**
 * Level Test API service
 * Prepares structure for future AI integration for CEFR level evaluation
 */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelTestResult {
  level: CefrLevel;
  explanation: string;
}

/**
 * Evaluate user's answer to determine CEFR level
 * Currently returns a random level as a placeholder
 * Future: Will integrate with AI model for actual evaluation
 * 
 * @param answer - User's answer or test response
 * @returns Promise with evaluated CEFR level and explanation
 */
export async function evaluateAnswer(answer: string): Promise<LevelTestResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Generate random level (placeholder)
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];

  const explanations: Record<CefrLevel, string> = {
    A1: 'Based on your response, you demonstrate basic English skills. You can understand and use familiar everyday expressions.',
    A2: 'Your answer shows elementary English proficiency. You can communicate in simple and routine tasks.',
    B1: 'You have intermediate English skills. You can understand the main points of clear standard input on familiar matters.',
    B2: 'You demonstrate upper-intermediate proficiency. You can understand the main ideas of complex text on both concrete and abstract topics.',
    C1: 'You show advanced English skills. You can understand a wide range of demanding, longer texts.',
    C2: 'You have mastery-level English proficiency. You can understand with ease virtually everything heard or read.',
  };

  // Future implementation will look like:
  // const response = await fetch('/api/level-test', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ answer }),
  // });
  // const data = await response.json();
  // return { level: data.level, explanation: data.explanation };

  return {
    level: randomLevel,
    explanation: explanations[randomLevel],
  };
}

/**
 * Evaluate multiple answers to determine overall CEFR level
 * @param answers - Array of user answers
 * @returns Promise with evaluated CEFR level and detailed explanation
 */
export async function evaluateMultipleAnswers(
  answers: string[]
): Promise<LevelTestResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

  // For now, evaluate based on average (placeholder logic)
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];

  const explanations: Record<CefrLevel, string> = {
    A1: 'Based on your responses, you demonstrate basic English skills across multiple areas.',
    A2: 'Your answers show elementary English proficiency with consistent performance.',
    B1: 'You have intermediate English skills with good understanding of various topics.',
    B2: 'You demonstrate upper-intermediate proficiency with strong language abilities.',
    C1: 'You show advanced English skills with excellent command of the language.',
    C2: 'You have mastery-level English proficiency with near-native capabilities.',
  };

  return {
    level: randomLevel,
    explanation: explanations[randomLevel],
  };
}

