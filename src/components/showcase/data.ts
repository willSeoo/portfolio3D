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
    id: 'about',
    title: 'About Me',
    category: 'Identity', // each model is a category: card = About
    year: '2026',
    href: '/about',
    // thumbnail: '/assets/me-front.jpg',   // your photo for the front of the ID
    // backImage: '/assets/me-back.jpg',    // optional full-bleed design for the back
  },
  {
    kind: 'model',
    model: 'phone',
    id: 'comick',
    title: 'UI/UX Design',
    category: 'ComicK Redesign', // phone = UI/UX Design
    year: '2026',
    href: '/projects/comick',
    thumbnail: 'https://picsum.photos/seed/comick-app/600/1300',
    tone: '#dce4cf',
  },
  {
    kind: 'model',
    model: 'oldpc',
    id: 'reel-weird',
    title: 'Software Engineering',
    category: 'Reel Weird', // old PC = Software Engineering
    year: '2026',
    href: '/projects/reel-weird',
    thumbnail: 'https://picsum.photos/seed/reel-weird-game/900/700',
    tone: '#ece0b9',
  },
  {
    kind: 'model',
    model: 'swatch',
    id: 'graphic',
    title: 'Graphic Design',
    category: 'Brand & Poster', // colour-swatch fan = Graphic Design
    year: '2026',
    href: '/projects/graphic',
  },
]
