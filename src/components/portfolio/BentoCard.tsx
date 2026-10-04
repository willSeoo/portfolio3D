import type { BentoItem } from './bentoData'
import { CATEGORY_LABEL } from './bentoData'

interface Props {
  item: BentoItem
  weight: number
  onOpen: (item: BentoItem, el: HTMLElement) => void
}

export function BentoCard({ item, weight, onOpen }: Props) {
  return (
    <button
      type="button"
      className="pf-card"
      style={{ flexGrow: weight }}
      data-cat={item.category}
      data-reveal
      aria-label={`Open ${item.title}`}
      onClick={(e) => onOpen(item, e.currentTarget)}
    >
      <div className="pf-card__media">
        {item.kind === 'video' ? (
          <video src={item.src} poster={item.poster} muted loop playsInline autoPlay preload="metadata" />
        ) : (
          <img src={item.src} alt="" loading="lazy" draggable={false} />
        )}
      </div>
      <span className="pf-card__shade" aria-hidden="true" />
      <span className="pf-card__chip">
        {CATEGORY_LABEL[item.category]} · {item.year}
      </span>
      <span className="pf-card__arrow" aria-hidden="true">
        {item.kind === 'video' ? '▶' : '↗'}
      </span>
      <span className="pf-card__title">{item.title}</span>
    </button>
  )
}
