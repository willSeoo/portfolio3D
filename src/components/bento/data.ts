import type { BentoItem } from './types'

// Swap these for real work any time — src/poster take any URL or a file dropped
// in public/assets/. Row layout follows the order below: the first two 'half'
// items share a row (asymmetric widths so it doesn't look like a rigid grid),
// then a 'full' item takes the next row by itself, and so on.
export const bentoItems: BentoItem[] = [
  {
    id: 'work-01',
    title: 'INGCO Graphic Work',
    category: 'work',
    span: 'half',
    widthRatio: 0.57,
    media: 'image',
    src: '/assets/projects/ingco.svg',
    tone: '#e7d3b8',
    blurb: 'Brand & packaging graphics for INGCO.',
  },
  {
    id: 'fun-01',
    title: 'Reel Weird',
    category: 'fun',
    span: 'half',
    widthRatio: 0.43,
    media: 'video',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://picsum.photos/seed/reel-weird-game/900/700',
    tone: '#ece0b9',
    blurb: 'A small, weird game project.',
  },
  {
    id: 'philosophy-01',
    title: 'On Making Things Slowly',
    category: 'philosophy',
    span: 'full',
    media: 'image',
    src: 'https://picsum.photos/seed/willi-philosophy/1600/700',
    tone: '#dce4cf',
    blurb: 'Notes on craft, patience, and shipping less — better.',
  },
]
