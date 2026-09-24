/** Every value maps to a shape defined in ProjectCard.css (.pc-frame[data-shape]). */
export type ImageStyle = 'landscape' | 'portrait' | 'square' | 'arch' | 'pill' | 'cut'

export interface ProjectLayout {
  /** Grid section only: where the card starts and how wide it is (12 columns). */
  colStart?: number
  colSpan?: number
  /** Marquee only: card width in px (capped on small screens). Defaults per imageStyle. */
  width?: number
  /** Card width / height. Defaults to a sensible value per imageStyle. */
  ratio?: number
  /** Vertical nudge (any CSS length) for the editorial stagger. */
  dy?: string
  /** Resting tilt in degrees. */
  rotate?: number
}

export interface Project {
  title: string
  category: string
  year: string
  image: string
  description: string
  tools: string[]
  imageStyle: ImageStyle
  href: string
  /** Card stock colour. Reused as the highlight on the back. */
  tone?: string
  layout?: ProjectLayout
}
