import statuses from '../data/claims.json';

// Review vs publish (PORTFOLIO DEC-009). A review build renders draft copy so the experience can be judged and shows
// which claims are not yet Cleared. A publish build refuses to build while any claim in use is not Cleared.
// Cleared is a content state: it authorizes no commit, push, publication, or deployment.
export const MODE: 'review' | 'publish' = process.env.PORTFOLIO_MODE === 'publish' ? 'publish' : 'review';

export type ClaimStatus = 'Cleared' | 'Ready' | 'Held' | 'Prohibited' | 'Gap';
const table = statuses as Record<string, ClaimStatus>;

export function statusOf(id: string): ClaimStatus {
  const s = table[id];
  if (!s) throw new Error(`Claim ${id} is not in src/data/claims.json. Run: npm run claims:sync`);
  return s;
}

/** Throws in every mode for Held, Prohibited, and Gap claims; in publish mode for anything not Cleared. */
export function useClaims(ids: string[], where: string): string[] {
  const uncleared: string[] = [];
  for (const id of [...new Set(ids)]) {
    const s = statusOf(id);
    if (s === 'Held' || s === 'Prohibited' || s === 'Gap') throw new Error(`${where}: claim ${id} is ${s} and must not be used`);
    if (s !== 'Cleared') uncleared.push(id);
  }
  if (MODE === 'publish' && uncleared.length) {
    throw new Error(`${where}: publish build blocked, claims not Cleared: ${uncleared.join(', ')}`);
  }
  return uncleared;
}
