import { getSqlite } from '@/db/client';

/**
 * "Before you meet X" briefing.
 *
 * Builds the one-line reminder of what a person currently believes, by reading
 * the who-knows edges. In Phase 2 this gets wired to calendar events (match
 * attendees -> people) so the briefing fires automatically before a meeting.
 */
export interface BriefingItem {
  claim: string;
  risk: string;
  believes: boolean;
}

export function getPersonBeliefs(personId: string): BriefingItem[] {
  return getSqlite().getAllSync<BriefingItem>(
    `SELECT l.claim AS claim, l.risk AS risk, k.believes AS believes
       FROM knows k
       JOIN lies l ON l.id = k.lie_id
      WHERE k.person_id = ?
        AND l.status = 'active'
      ORDER BY l.occurred_at DESC`,
    [personId],
  );
}

export function buildBriefingText(name: string, items: BriefingItem[]): string {
  if (items.length === 0) return `No active stories with ${name}. You're clean.`;
  const claims = items.slice(0, 4).map((i) => `• ${i.claim}`);
  const more =
    items.length > 4 ? `\n…and ${items.length - 4} more` : '';
  return `${name} currently believes:\n${claims.join('\n')}${more}`;
}
