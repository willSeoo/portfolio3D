import { useEffect, useRef } from 'react'
import type { RefObject, ReactNode } from 'react'
import './hero-transition.css'

interface Props {
  /** Bento Box #1's real DOM node — the transition's destination, measured live every frame. */
  targetRef: RefObject<HTMLElement | null>
  children: ReactNode
}

// Extra scroll distance (beyond the initial 100vh view) the shrink+move
// transition plays out over. After that, the shrunken clone keeps tracking
// Box #1 live for a little longer (see SETTLE below) so it can rise fully
// into view before we hand off to the real card underneath — otherwise the
// transform would "complete" right as Box #1 is still at the bottom edge of
// the viewport.
const SHRINK_VH = 130
const SETTLE_VH = 90
const CARD_RADIUS_PX = 28

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function HeroTransition({ targetRef, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const wrap = wrapRef.current
      const clone = cloneRef.current
      const target = targetRef.current
      if (!wrap || !clone || !target) return

      const wrapRect = wrap.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Once the whole wrap (shrink distance + settle distance) has scrolled
      // past, the real Bento card underneath is what's visible — hide the clone.
      if (wrapRect.bottom <= 0) {
        clone.style.opacity = '0'
        clone.style.pointerEvents = 'none'
        return
      }

      const shrinkDistance = (SHRINK_VH / 100) * vh
      const raw = shrinkDistance > 0 ? -wrapRect.top / shrinkDistance : 0
      const progress = clamp(raw, 0, 1)
      const eased = easeInOutCubic(progress)

      clone.style.opacity = '1'
      clone.style.pointerEvents = progress > 0.02 ? 'none' : 'auto'

      const t = target.getBoundingClientRect()
      const scaleX = lerp(1, t.width / vw, eased)
      const scaleY = lerp(1, t.height / vh, eased)
      const tx = lerp(0, t.left + t.width / 2 - vw / 2, eased)
      const ty = lerp(0, t.top + t.height / 2 - vh / 2, eased)
      const avgScale = lerp(1, (t.width / vw + t.height / vh) / 2, eased)
      const radius = lerp(0, CARD_RADIUS_PX / Math.max(avgScale, 0.001), eased)

      clone.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`
      clone.style.borderRadius = `${radius}px`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [targetRef])

  return (
    <div ref={wrapRef} className="hero-trans-wrap" style={{ height: `calc(${SHRINK_VH}vh + ${SETTLE_VH}vh + 100vh)` }}>
      <div ref={cloneRef} className="hero-trans-clone">
        {children}
      </div>
    </div>
  )
}
