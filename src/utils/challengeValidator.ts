import { Challenge, Difficulty, ValidationMode } from '../types/challenge';

export interface ValidationIssue {
  field: string;
  message: string;
}

export function validateChallenge(data: unknown): { valid: boolean; errors: ValidationIssue[]; challenge?: Challenge } {
  const errors: ValidationIssue[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'root', message: 'Challenge must be a valid JSON object' }] };
  }

  const obj = data as Record<string, unknown>;

  // Required string fields
  const requiredStringFields: Array<keyof Pick<Challenge, 'id' | 'title' | 'category' | 'summary' | 'theory' | 'starterCode' | 'solutionCode'>> = [
    'id',
    'title',
    'category',
    'summary',
    'theory',
    'starterCode',
    'solutionCode'
  ];

  for (const field of requiredStringFields) {
    if (typeof obj[field] !== 'string' || !(obj[field] as string).trim()) {
      errors.push({ field, message: `Field "${field}" is required and must be a non-empty string.` });
    }
  }

  // Difficulty
  const validDifficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
  if (!validDifficulties.includes(obj.difficulty as Difficulty)) {
    errors.push({
      field: 'difficulty',
      message: `Difficulty must be one of: ${validDifficulties.join(', ')} (got "${obj.difficulty}")`
    });
  }

  // Validation Mode
  const validModes: ValidationMode[] = ['tests', 'output', 'compile'];
  if (!validModes.includes(obj.validationMode as ValidationMode)) {
    errors.push({
      field: 'validationMode',
      message: `ValidationMode must be one of: ${validModes.join(', ')} (got "${obj.validationMode}")`
    });
  }

  // Requirements (Array of strings)
  if (!Array.isArray(obj.requirements) || obj.requirements.length === 0) {
    errors.push({ field: 'requirements', message: 'Requirements must be a non-empty array of strings.' });
  } else if (!obj.requirements.every(r => typeof r === 'string')) {
    errors.push({ field: 'requirements', message: 'Every item in requirements must be a string.' });
  }

  // Hints (Array of strings)
  if (!Array.isArray(obj.hints)) {
    errors.push({ field: 'hints', message: 'Hints must be an array of strings.' });
  } else if (!obj.hints.every(h => typeof h === 'string')) {
    errors.push({ field: 'hints', message: 'Every item in hints must be a string.' });
  }

  // If validationMode is 'tests', testCode is required
  if (obj.validationMode === 'tests') {
    if (typeof obj.testCode !== 'string' || !obj.testCode.trim()) {
      errors.push({
        field: 'testCode',
        message: 'When validationMode is "tests", "testCode" is required (containing #[cfg(test)] mod tests { ... }).'
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const challenge: Challenge = {
    id: String(obj.id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    title: String(obj.title).trim(),
    category: String(obj.category).trim(),
    difficulty: obj.difficulty as Difficulty,
    summary: String(obj.summary).trim(),
    theory: String(obj.theory),
    requirements: obj.requirements as string[],
    hints: obj.hints as string[],
    starterCode: String(obj.starterCode),
    solutionCode: String(obj.solutionCode),
    testCode: typeof obj.testCode === 'string' ? obj.testCode : undefined,
    expectedOutput: typeof obj.expectedOutput === 'string' ? obj.expectedOutput : undefined,
    validationMode: obj.validationMode as ValidationMode,
    isCustom: true
  };

  return { valid: true, errors: [], challenge };
}

export function validateChallengeList(data: unknown): { valid: boolean; challenges: Challenge[]; errors: string[] } {
  if (!Array.isArray(data)) {
    // Check if it's a single challenge
    const single = validateChallenge(data);
    if (single.valid && single.challenge) {
      return { valid: true, challenges: [single.challenge], errors: [] };
    }
    return { valid: false, challenges: [], errors: ['Input must be a JSON array of challenges or a single challenge object.'] };
  }

  const challenges: Challenge[] = [];
  const errors: string[] = [];

  data.forEach((item, index) => {
    const res = validateChallenge(item);
    if (res.valid && res.challenge) {
      challenges.push(res.challenge);
    } else {
      errors.push(`Item #${index + 1} (${(item as any)?.title || 'Untitled'}): ${res.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    challenges,
    errors
  };
}
