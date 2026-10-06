import type { BentoItem } from './bentoData'

interface Props {
  item: BentoItem
  weight: number
  onOpen: (item: BentoItem, el: HTMLElement) => void
}

export function BentoCard({ item, weight, onOpen }: Props) {
  if (item.kind === 'experience') {
    // Not a button: it holds its own scrollable list and doesn't open the lightbox.
    return (
      <section className="pf-card pf-card--exp" style={{ flexGrow: weight }} data-cat={item.category} data-reveal>
        <header className="pf-exp__head">{item.heading ?? item.title}</header>
        <div className="pf-exp__body">
          <div className="pf-exp__scroll" tabIndex={0} role="region" aria-label={`${item.heading ?? item.title}, scrollable`}>
            {item.entries?.map((en) => (
              <article className="pf-exp__row" key={`${en.from}-${en.title}`}>
                <div className="pf-exp__when">
                  <span>{en.from}</span>
                  <i aria-hidden="true" />
                  <span>{en.to}</span>
                </div>
                <div className="pf-exp__what">
                  <h3>{en.title}</h3>
                  <p>{en.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="pf-exp__fade pf-exp__fade--top" aria-hidden="true" />
          <div className="pf-exp__fade pf-exp__fade--bottom" aria-hidden="true" />
        </div>
      </section>
    )
  }
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
