import { useEffect, useRef } from 'react'
import type { BentoItem } from './bentoData'
import { GlobeCanvas } from './globe/GlobeCanvas'
import { GlobeInfo } from './globe/GlobeInfo'

interface Props {
  item: BentoItem
  weight: number
  onOpen: (item: BentoItem, el: HTMLElement) => void
}

/** Experience list: one scroll area covering the whole card, so its scrollbar runs top to bottom. */
function ExperienceCard({ item, weight }: { item: BentoItem; weight: number }) {
  const card = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  // the edge fades only show on the side that still has more to scroll to
  const sync = () => {
    const s = scroller.current
    const c = card.current
    if (!s || !c) return
    c.dataset.atTop = s.scrollTop <= 4 ? 'true' : 'false'
    c.dataset.atEnd = s.scrollTop + s.clientHeight >= s.scrollHeight - 4 ? 'true' : 'false'
  }
  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  return (
    <section ref={card} className="pf-card pf-card--exp" style={{ flexGrow: weight }} data-cat={item.category} data-reveal data-at-top="true" data-at-end="false">
      <div ref={scroller} className="pf-exp__scroll" tabIndex={0} role="region" aria-label={`${item.heading ?? item.title}, scrollable`} onScroll={sync}>
        <header className="pf-exp__head">{item.heading ?? item.title}</header>
        <div className="pf-exp__list">
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
      </div>
      <div className="pf-exp__fade pf-exp__fade--top" aria-hidden="true" />
      <div className="pf-exp__fade pf-exp__fade--bottom" aria-hidden="true" />
    </section>
  )
}

function currentPeriod() {
  const d = new Date()
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
}

export function BentoCard({ item, weight, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null)

  if (item.kind === 'experience') return <ExperienceCard item={item} weight={weight} />

  if (item.kind === 'globe') {
    // Drag spins the globe (system grab cursor), a tap opens it bigger. The <button> is only
    // there for keyboard users (Enter / Space) — mouse taps are reported by the globe itself.
    return (
      <button
        ref={ref}
        type="button"
        className="pf-card pf-card--globe"
        style={{ flexGrow: weight }}
        data-cat={item.category}
        data-reveal
        aria-label={`${item.title}: open`}
        onClick={(e) => {
          if (e.detail === 0 && ref.current) onOpen(item, ref.current)
        }}
      >
        <GlobeCanvas onTap={() => ref.current && onOpen(item, ref.current)} />
        <GlobeInfo />
      </button>
    )
  }

  const cls = ['pf-card', item.shape === 'tall' && 'pf-card--tall', item.mono && 'pf-card--mono'].filter(Boolean).join(' ')
  return (
    <button
      ref={ref}
      type="button"
      className={cls}
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
      {item.overlay && (
        <>
          <div className="pf-card__shade" aria-hidden="true" />
          <div className="pf-ov pf-ov--top">
            <span>Status: {item.overlay.status}</span>
            <i className="pf-ov__live" aria-hidden="true" />
          </div>
          <div className="pf-ov pf-ov--bottom">
            <span>{item.overlay.period ?? currentPeriod()}</span>
          </div>
        </>
      )}
    </button>
  )
}
