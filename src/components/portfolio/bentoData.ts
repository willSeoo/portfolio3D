export type BentoCategory = 'work' | 'fun' | 'philosophy'

export interface BentoItem {
  id: string
  category: BentoCategory
  title: string
  year: string
  /** Text shown under the expanded view. */
  blurb: string
  kind: 'image' | 'video'
  /** Image URL, or the video file URL when kind === 'video'. */
  src: string
  /** Video only: still frame shown before it loads. */
  poster?: string
  /** Optional: where the ↗ arrow in the expanded view goes (case study, repo, …). */
  href?: string
}

export const CATEGORY_LABEL: Record<BentoCategory, string> = {
  work: 'Work',
  fun: 'Fun',
  philosophy: 'Philosophy',
}

// Bento #1 is always the 3D hero (the carousel) — these are bento #2 onwards.
// Swap `src` for your own files any time: drop them in /public/assets/ and use '/assets/xxx.jpg',
// or paste any URL. The picsum.photos images are placeholders. Add or remove items freely —
// the grid re-flows itself.
export const bentoItems: BentoItem[] = [
  {
    id: 'ledger',
    category: 'work',
    title: 'Ledger — finance agent UI',
    year: '2026',
    blurb:
      'Interface for an AI bookkeeping agent: it asks clarifying questions, drafts a plan, and waits for approval before touching a single entry.',
    kind: 'image',
    src: 'https://picsum.photos/seed/ledger-ui/1600/1000',
    href: '/projects/ledger',
  },
  {
    id: 'brutalist-type',
    category: 'philosophy',
    title: 'Make it slowly',
    year: '2026',
    blurb:
      'Notes on craft: why the third pass over a detail is usually where a thing starts to feel inevitable instead of merely finished.',
    kind: 'image',
    src: 'https://picsum.photos/seed/slow-craft/1800/900',
  },
  {
    id: 'flower-loop',
    category: 'fun',
    title: 'Loop study',
    year: '2025',
    blurb: 'A tiny motion experiment — a seamless loop that is more about timing than about the subject.',
    kind: 'video',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://picsum.photos/seed/loop-study/1200/800',
  },
  {
    id: 'comick',
    category: 'work',
    title: 'ComicK redesign',
    year: '2026',
    blurb: 'A calmer reading experience for a manga tracker: fewer chrome, bigger covers, one-handed navigation.',
    kind: 'image',
    src: 'https://picsum.photos/seed/comick-redesign/1400/1100',
    href: '/projects/comick',
  },
  {
    id: 'reel-weird',
    category: 'fun',
    title: 'Reel Weird',
    year: '2026',
    blurb: 'A small fishing game that is a little too strange to be relaxing. Built for a game jam, kept for the vibes.',
    kind: 'image',
    src: 'https://picsum.photos/seed/reel-weird-cover/1500/1000',
    href: '/projects/reel-weird',
  },
  {
    id: 'less-but-better',
    category: 'philosophy',
    title: 'Less, but better',
    year: '2025',
    blurb: 'What I cut from every project before shipping it, and what that says about what I think the project is for.',
    kind: 'image',
    src: 'https://picsum.photos/seed/less-better/1400/1000',
  },
  {
    id: 'snapshots',
    category: 'fun',
    title: 'Snapshots',
    year: '2026',
    blurb: 'Photos that did not belong anywhere else.',
    kind: 'image',
    src: 'https://picsum.photos/seed/willi-snapshots/1300/1000',
    href: '/photos',
  },
]
