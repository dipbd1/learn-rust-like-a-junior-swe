export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ValidationMode = 'tests' | 'output' | 'compile';

export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  summary: string;
  theory: string; // Markdown supported explanation with code snippets
  requirements: string[]; // List of specific objectives to fulfill
  hints: string[]; // Progressive clues
  starterCode: string;
  solutionCode: string;
  testCode?: string; // Rust unit tests: #[cfg(test)] mod tests { ... }
  expectedOutput?: string; // Optional expected stdout
  validationMode: ValidationMode;
  isCustom?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitDetail?: string;
  executionTime?: number;
  testSummary?: {
    total: number;
    passed: number;
    failed: number;
    raw: string;
  };
  diagnostics?: Array<{
    level: 'error' | 'warning' | 'note' | 'help';
    message: string;
    line?: number;
  }>;
}

export interface UserProgress {
  completedIds: string[];
  savedCode: Record<string, string>; // challengeId -> user's code
  revealedHints: Record<string, number>; // challengeId -> hint count revealed
  currentChallengeId: string;
}
