import type { CSSProperties } from 'react'
import type { BentoItem } from './types'

interface Props {
  item: BentoItem
  onOpen: (item: BentoItem) => void
  /** Attach a DOM ref (used by the hero-to-bento scroll transition to find its landing spot). */
  targetRef?: React.RefObject<HTMLButtonElement | null>
  style?: CSSProperties
}

export function BentoCard({ item, onOpen, targetRef, style }: Props) {
  return (
    <button
      type="button"
      ref={targetRef}
      className={`bento-card bento-card--${item.span}`}
      style={{ background: item.tone, ...style }}
      onClick={() => onOpen(item)}
    >
      <img className="bento-card__img" src={item.poster ?? item.src} alt={item.title} loading="lazy" />
      {item.media === 'video' && (
        <span className="bento-card__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M8 4 L18 12 L8 20 Z" fill="currentColor" />
          </svg>
        </span>
      )}
      <span className="bento-card__scrim" />
      <span className="bento-card__label">
        <span className="bento-card__category">{item.category}</span>
        <span className="bento-card__title">{item.title}</span>
      </span>
    </button>
  )
}
