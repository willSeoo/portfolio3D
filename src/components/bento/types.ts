export type BentoCategory = 'work' | 'fun' | 'philosophy'
export type BentoMediaKind = 'image' | 'video'

export interface BentoItem {
  id: string
  title: string
  category: BentoCategory
  /** 'half' sits two-per-row (max 2), 'full' takes the whole row. */
  span: 'half' | 'full'
  /** Within a half row, how much of the row this card takes (the other card gets the rest) — this is what makes rows feel a little random instead of a rigid 50/50 grid. */
  widthRatio?: number
  media: BentoMediaKind
  src: string
  /** Poster/cover shown before a video is opened. */
  poster?: string
  tone: string
  blurb?: string
}
