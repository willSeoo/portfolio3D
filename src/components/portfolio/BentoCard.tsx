import type { BentoItem } from './bentoData'

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
      data-cursor-label={item.kind === 'video' ? 'Open this video' : 'Open this project'}
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
    </button>
  )
}
