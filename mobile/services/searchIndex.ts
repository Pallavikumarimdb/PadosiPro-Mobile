import type { Category } from './padosi';

export interface Suggestion {
  phrase: string;
  category: string;
  helpKind?: string;
  service?: string;
  diyLabel?: string;
  diyUrl?: string;
}

const BOOKING_DIY = {
  diyLabel: 'Prefer to do it yourself? Book on Booking.com',
  diyUrl: 'https://www.booking.com',
};

const POLICYBAAZAAR_DIY = {
  diyLabel: 'Prefer to do it yourself? Book on PolicyBazaar',
  diyUrl: 'https://www.policybazaar.com',
};

/** Hand-picked phrases (as seen in the reference) mapped to the closest real category. */
const CURATED: Suggestion[] = [
  { phrase: 'Travel & stay for guests', category: 'Travel & Tourism', helpKind: 'Book Travel', service: 'Travel & stay for guests', ...BOOKING_DIY },
  { phrase: 'Hotel & homestay selection', category: 'Travel & Tourism', helpKind: 'Book Travel', service: 'Hotel & homestay selection', ...BOOKING_DIY },
  { phrase: 'Event day logistics coordination', category: 'Events & Management', helpKind: 'Weddings', service: 'Event day logistics coordination' },
  { phrase: 'Train booking (tatkal, waitlist handling)', category: 'Travel & Tourism', helpKind: 'Book Travel', service: 'Train booking (tatkal, waitlist handling)' },
  { phrase: 'Book train', category: 'Travel & Tourism', helpKind: 'Book Travel', service: 'Book train' },
  { phrase: 'Travel insurance coordination', category: 'Travel & Tourism', helpKind: 'Documents & Visa', service: 'Travel insurance coordination', ...POLICYBAAZAAR_DIY },
  { phrase: 'Insurance claim coordination', category: 'Insurance & Loans', helpKind: 'Claims', service: 'Insurance claim coordination', ...POLICYBAAZAAR_DIY },
  { phrase: 'Insurance paperwork support', category: 'Insurance & Loans', helpKind: 'Paperwork', service: 'Insurance paperwork support', ...POLICYBAAZAAR_DIY },
  { phrase: 'Training & instruction coordination', category: 'Education Support', helpKind: 'Coaching', service: 'Training & instruction coordination' },
  { phrase: 'Track attendance', category: 'Senior Care', helpKind: 'Check-in', service: 'Daily check-in call' },
];

/**
 * Search the catalog (every help-kind + every service) plus curated phrases.
 * Word-level matching: a phrase scores for the full-query prefix hit plus each
 * query word it contains, so "travel insurance" ranks "Travel insurance
 * coordination" first while keeping "Insurance claim coordination" and
 * "Insurance paperwork support" as other possibilities.
 */
export function searchCatalog(query: string, tasks: Category[]): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const pool: Suggestion[] = [...CURATED];
  const seen = new Set(pool.map((s) => s.phrase.toLowerCase()));
  for (const t of tasks) {
    if (t.comingSoon) continue;
    for (const k of t.kinds ?? []) {
      if (seen.has(k.toLowerCase())) continue;
      seen.add(k.toLowerCase());
      pool.push({ phrase: k, category: t.title, helpKind: k, service: k });
    }
    for (const [kindLabel, services] of Object.entries(t.servicesByKind ?? {})) {
      for (const s of services ?? []) {
        if (seen.has(s.toLowerCase())) continue;
        seen.add(s.toLowerCase());
        pool.push({ phrase: s, category: t.title, helpKind: kindLabel, service: s });
      }
    }
  }
  const scored: { s: Suggestion; score: number }[] = [];
  for (const s of pool) {
    const p = s.phrase.toLowerCase();
    let score = 0;
    if (p.startsWith(q)) score += 2;
    else if (!p.includes(q)) {
      for (const w of words) {
        if (w.length > 1 && p.includes(w)) score += 1;
      }
      if (score === 0) continue;
    } else {
      score += 1;
    }
    scored.push({ s, score });
  }
  scored.sort((a, b) => b.score - a.score || a.s.phrase.length - b.s.phrase.length);
  return scored.map((x) => x.s);
}
