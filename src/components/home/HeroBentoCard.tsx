import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { BentoItem } from './bentoData'
import { HeroObjectScene } from './HeroObjectScene'

gsap.registerPlugin(ScrollTrigger)

const BENTO_RADIUS = 28 // px — must match .bento-card's own border-radius
const DOCK_THRESHOLD = 0.995
const ease = gsap.parseEase('power2.inOut') as (p: number) => number
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

interface Props {
  item: BentoItem
  spacerRef: RefObject<HTMLDivElement | null>
  onOpen: (item: BentoItem) => void
}

/**
 * The literal moving hero: same DOM node the whole time, no duplicate. While
 * scrolling through `spacerRef`'s range it's `position: fixed`, interpolated
 * between fullscreen and this card's own live getBoundingClientRect(). Once
 * fully docked it switches to `position: absolute; inset: 0`, so from then on
 * it just scrolls normally as part of the grid — no further per-frame tracking
 * needed, and no jump, because that's exactly where it already was sitting.
 */
export function HeroBentoCard({ item, spacerRef, onOpen }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const [docked, setDocked] = useState(false)
  const dockedRef = useRef(false)

  useEffect(() => {
    const applyProgress = (raw: number) => {
      const hero = heroRef.current
      const card = cardRef.current
      const caption = captionRef.current
      if (!hero || !card) return
      const p = ease(Math.min(1, Math.max(0, raw)))
      const isDocked = raw >= DOCK_THRESHOLD

      if (isDocked !== dockedRef.current) {
        dockedRef.current = isDocked
        setDocked(isDocked)
      }

      if (isDocked) {
        // Handed off to CSS (position: absolute; inset: 0) — stop fighting it with inline styles.
        hero.style.cssText = ''
        if (caption) caption.style.opacity = '0'
        return
      }

      const vw = window.innerWidth
      const vh = window.innerHeight
      const rect = card.getBoundingClientRect()
      const top = lerp(0, rect.top, p)
      const left = lerp(0, rect.left, p)
      const width = lerp(vw, rect.width, p)
      const height = lerp(vh, rect.height, p)
      const radius = lerp(0, BENTO_RADIUS, p)
      hero.style.position = 'fixed'
      hero.style.top = `${top}px`
      hero.style.left = `${left}px`
      hero.style.width = `${width}px`
      hero.style.height = `${height}px`
      hero.style.borderRadius = `${radius}px`
      hero.style.boxShadow = `0 ${lerp(0, 40, p)}px ${lerp(0, 80, p)}px rgba(20,20,20,${lerp(0, 0.22, p)})`
      if (caption) caption.style.opacity = `${Math.max(0, 1 - p * 1.6)}`
    }

    const st = ScrollTrigger.create({
      trigger: spacerRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.35,
      onUpdate: (self) => applyProgress(self.progress),
      onRefresh: (self) => applyProgress(self.progress),
    })
    applyProgress(0)

    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={cardRef} className="bento-card bento-card--hero" style={{ gridColumn: `span ${item.span}` }}>
      <div ref={heroRef} className={`hero-object${docked ? ' hero-object--docked' : ''}`}>
        <HeroObjectScene />
        <div ref={captionRef} className="hero-object__caption">
          <span className="hero-object__eyebrow">Willi · HCI Engineer</span>
          <h1>Scroll to meet me</h1>
        </div>
      </div>
      {docked && (
        <button type="button" className="bento-card__dock-hit" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`}>
          <div className="bento-card__scrim" />
          <div className="bento-card__label">
            <span className="bento-card__category">{item.category}</span>
            <h3>{item.title}</h3>
          </div>
        </button>
      )}
    </div>
  )
}
