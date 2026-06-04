import { createLie } from './repo';
import { getSqlite } from './client';

/**
 * Funny, relatable example lies used to defeat the "blank page problem" during
 * onboarding (research: contextual empty states + sample data lift task
 * completion ~30-45%). Tapping a suggestion seeds a real entry so the
 * person/story model is visible immediately.
 */
export const EXAMPLE_LIES: { claim: string; person: string; story?: string }[] =
  [
    { claim: 'Told my boss I was sick', person: 'Boss', story: 'Mental health Friday' },
    { claim: 'Said I loved the gift', person: 'Aunt Carol' },
    { claim: "Told Mom I quit smoking", person: 'Mom', story: 'The smoking thing' },
    { claim: "Said I'm '5 minutes away'", person: 'Dani' },
    { claim: 'Pretended I read the group chat', person: 'The group chat' },
  ];

export function seedExample(example: {
  claim: string;
  person: string;
  story?: string;
}): string {
  return createLie({
    claim: example.claim,
    peopleNames: [example.person],
    storyTitle: example.story,
    risk: 'low',
  });
}

export function hasAnyLies(): boolean {
  const row = getSqlite().getFirstSync<{ c: number }>(
    'SELECT COUNT(*) AS c FROM lies',
  );
  return (row?.c ?? 0) > 0;
}
