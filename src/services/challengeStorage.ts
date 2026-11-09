import { Challenge, UserProgress } from '../types/challenge';
import { DEFAULT_CHALLENGES } from '../data/defaultChallenges';
import { validateChallengeList } from '../utils/challengeValidator';

const PROGRESS_KEY = 'rust_learn_user_progress_v1';
const CUSTOM_CHALLENGES_KEY = 'rust_learn_custom_challenges_v1';

export function getStoredProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
        savedCode: typeof parsed.savedCode === 'object' && parsed.savedCode !== null ? parsed.savedCode : {},
        revealedHints: typeof parsed.revealedHints === 'object' && parsed.revealedHints !== null ? parsed.revealedHints : {},
        currentChallengeId: typeof parsed.currentChallengeId === 'string' ? parsed.currentChallengeId : DEFAULT_CHALLENGES[0].id,
      };
    }
  } catch (e) {
    console.error('Failed to read stored progress:', e);
  }

  return {
    completedIds: [],
    savedCode: {},
    revealedHints: {},
    currentChallengeId: DEFAULT_CHALLENGES[0].id,
  };
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
}

export function getCustomChallenges(): Challenge[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CHALLENGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const res = validateChallengeList(parsed);
      if (res.valid) {
        return res.challenges.map(c => ({ ...c, isCustom: true }));
      }
    }
  } catch (e) {
    console.error('Failed to parse custom challenges from localStorage:', e);
  }
  return [];
}

export function saveCustomChallenges(challenges: Challenge[]): void {
  try {
    const customOnly = challenges.filter(c => c.isCustom);
    localStorage.setItem(CUSTOM_CHALLENGES_KEY, JSON.stringify(customOnly));
  } catch (e) {
    console.error('Failed to save custom challenges to localStorage:', e);
  }
}

export function getAllChallenges(): Challenge[] {
  const custom = getCustomChallenges();
  // Merge built-in and custom, avoiding ID collisions
  const map = new Map<string, Challenge>();
  for (const c of DEFAULT_CHALLENGES) {
    map.set(c.id, c);
  }
  for (const c of custom) {
    map.set(c.id, c);
  }
  return Array.from(map.values());
}

export function addCustomChallenge(challenge: Challenge): { success: boolean; error?: string } {
  const current = getCustomChallenges();
  if (DEFAULT_CHALLENGES.some(c => c.id === challenge.id)) {
    return { success: false, error: `Challenge ID "${challenge.id}" conflicts with a built-in challenge.` };
  }
  const filtered = current.filter(c => c.id !== challenge.id);
  filtered.push({ ...challenge, isCustom: true });
  saveCustomChallenges(filtered);
  return { success: true };
}

export function deleteCustomChallenge(id: string): boolean {
  const current = getCustomChallenges();
  const filtered = current.filter(c => c.id !== id);
  if (filtered.length !== current.length) {
    saveCustomChallenges(filtered);
    return true;
  }
  return false;
}

export function exportChallengesAsJson(challenges: Challenge[]): string {
  return JSON.stringify(challenges, null, 2);
}

export function resetAllUserProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}
