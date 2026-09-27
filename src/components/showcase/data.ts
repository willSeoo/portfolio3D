import type { ShowcaseItem } from './types'

// Swap `thumbnail`/`src` for your own images any time — drop a file in
// public/assets/projects/ and point to it here, or paste any URL. The
// phone/PC/photo entries below use placeholder photos from picsum.photos
// (a free random-image placeholder service) so the screens aren't empty —
// replace them with real screenshots whenever you're ready.
export const showcaseItems: ShowcaseItem[] = [
  {
    kind: 'model',
    model: 'card',
    id: 'ingco',
    title: 'INGCO Graphic Work',
    category: 'Graphic design',
    year: '2025',
    href: '/projects/ingco',
    thumbnail: '/assets/projects/ingco.svg',
    tone: '#f0d6c9',
  },
  {
    kind: 'model',
    model: 'phone',
    id: 'comick',
    title: 'ComicK Redesign',
    category: 'UI/UX',
    year: '2026',
    href: '/projects/comick',
    thumbnail: 'https://picsum.photos/seed/comick-app/600/1300',
    tone: '#dce4cf',
  },
  {
    kind: 'model',
    model: 'oldpc',
    id: 'reel-weird',
    title: 'Reel Weird',
    category: 'Game',
    year: '2026',
    href: '/projects/reel-weird',
    thumbnail: 'https://picsum.photos/seed/reel-weird-game/900/700',
    tone: '#ece0b9',
  },
  {
    kind: 'photo',
    id: 'snapshot',
    title: 'Snapshot',
    category: 'Personal',
    year: '2026',
    href: '/photos',
    src: 'https://picsum.photos/seed/willi-snapshot/1200/900',
  },
]
