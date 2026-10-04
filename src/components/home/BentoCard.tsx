import type { BentoItem } from './bentoData'

export function BentoCard({ item, onOpen }: { item: BentoItem; onOpen: (item: BentoItem) => void }) {
  return (
    <button
      type="button"
      className="bento-card"
      style={{ gridColumn: `span ${item.span}` }}
      onClick={() => onOpen(item)}
      aria-label={`Open ${item.title}`}
    >
      <img src={item.media.src} alt="" className="bento-card__media" loading="lazy" />
      <div className="bento-card__scrim" />
      <div className="bento-card__label">
        <span className="bento-card__category">{item.category}</span>
        <h3>{item.title}</h3>
      </div>
    </button>
  )
}
