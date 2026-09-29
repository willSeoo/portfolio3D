export type ModelType = 'card' | 'phone' | 'oldpc'

interface ShowcaseItemBase {
  id: string
  title: string
  category: string
  year: string
  /** Where the popup's "O" (open) button sends the person. */
  href: string
}

/** Rendered as a real 3D model inside the WebGL stage. */
export interface ModelShowcaseItem extends ShowcaseItemBase {
  kind: 'model'
  model: ModelType
  /** Image shown on the card/phone/PC screen. Falls back to a generated placeholder if missing. */
  thumbnail?: string
  /** ID card only: a full-bleed photo/design for the card's back. Omit for the generated back. */
  backImage?: string
  /** Accent color (card back, phone/PC screen bezel glow). */
  tone?: string
}

/** Rendered as a third-party embed (e.g. Sketchfab) instead of our own geometry. */
export interface EmbedShowcaseItem extends ShowcaseItemBase {
  kind: 'embed'
  embedUrl: string
  embedTitle: string
  embedAuthor: string
  embedAuthorUrl: string
  sourceUrl: string
}

/** A plain photo in the same size/box style the embed slide used. */
export interface PhotoShowcaseItem extends ShowcaseItemBase {
  kind: 'photo'
  src: string
}

export type ShowcaseItem = ModelShowcaseItem | EmbedShowcaseItem | PhotoShowcaseItem
