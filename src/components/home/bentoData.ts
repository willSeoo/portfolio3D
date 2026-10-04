export type BentoMedia = { kind: 'image' | 'video'; src: string }

export interface BentoItem {
  id: string
  title: string
  category: 'Work' | 'Fun' | 'Philosophy'
  /** grid columns this card spans, out of the 2-column grid. */
  span: 1 | 2
  media: BentoMedia
  description: string
}

// Box #1 is the hero's landing spot — its `media` is only used as the static
// preview shown once the 3D hero has docked into it and you click to expand.
// Swap any `src` for your own image/video any time.
export const bentoItems: BentoItem[] = [
  {
    id: 'about',
    title: 'About Me',
    category: 'Work',
    span: 1,
    media: { kind: 'image', src: 'https://picsum.photos/seed/willi-about/1000/1000' },
    description: 'A little identity card, a little résumé — drag it around on the way down.',
  },
  {
    id: 'comick',
    title: 'ComicK Redesign',
    category: 'Work',
    span: 1,
    media: { kind: 'image', src: 'https://picsum.photos/seed/comick-bento/1000/1000' },
    description: 'A PWA redesign of the ComicK reading experience — faster browsing, calmer chapter pages.',
  },
  {
    id: 'reel-weird',
    title: 'Reel Weird',
    category: 'Fun',
    span: 2,
    media: { kind: 'image', src: 'https://picsum.photos/seed/reel-weird-bento/1600/700' },
    description: 'A browser fishing game running on a custom canvas engine.',
  },
  {
    id: 'philosophy',
    title: 'How I Work',
    category: 'Philosophy',
    span: 1,
    media: { kind: 'image', src: 'https://picsum.photos/seed/philosophy-bento/1000/1000' },
    description: 'Notes on process, taste, and shipping things that feel considered.',
  },
  {
    id: 'ingco',
    title: 'INGCO Graphic Work',
    category: 'Work',
    span: 1,
    media: { kind: 'image', src: 'https://picsum.photos/seed/ingco-bento/1000/1000' },
    description: 'Campaign and product graphics made in-house, from print layouts to social posts.',
  },
]
