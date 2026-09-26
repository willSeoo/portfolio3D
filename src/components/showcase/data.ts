import type { ShowcaseItem } from './types'

// Swap `thumbnail` for your own image any time — drop a file in
// public/assets/projects/ and point to it here. No thumbnail = a
// generated placeholder, so nothing breaks while you're filling these in.
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
    thumbnail: '/assets/projects/comick.svg',
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
    thumbnail: '/assets/projects/reel-weird.svg',
    tone: '#ece0b9',
  },
  {
    kind: 'embed',
    id: 'cat',
    title: 'My Cat',
    category: 'Personal',
    year: '2026',
    href: '/cats',
    embedUrl: 'https://sketchfab.com/models/107d19cd699b45a5a7683aa4f9ce0d0d/embed',
    embedTitle: 'Cat box meme',
    embedAuthor: 'Adrian.Alexis.Liberato',
    embedAuthorUrl: 'https://sketchfab.com/Adrian.Alexis.Liberato',
    sourceUrl: 'https://sketchfab.com/3d-models/cat-box-meme-107d19cd699b45a5a7683aa4f9ce0d0d',
  },
]
