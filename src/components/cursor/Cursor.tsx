import { useEffect, useRef, useState } from 'react'
import { MODEL_CURSOR_EVENT } from './cursorBus'
import './cursor.css'

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor-hover]'

interface Label {
  text: string
  icon: 'eye' | 'up'
}

function Icon({ name }: { name: Label['icon'] }) {
  return name === 'up' ? (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/**
 * Custom cursor (fine pointers only):
 *  - default: a small grey dot; it swells a little over anything clickable
 *  - over a bento: a pill with an eye icon + "Open this project / video" (from data-cursor-label)
 *  - over a 3D model: steps aside so the normal grab / grabbing cursor shows
 */
export function Cursor() {
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<Label>({ text: 'Open this project', icon: 'eye' })

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current!
    const html = document.documentElement
    html.classList.add('cur-on')

    const t = { x: -100, y: -100 }
    const c = { x: -100, y: -100 }
    let seen = false // has the mouse moved yet (don't fly in from the corner)
    let raf = 0
    let scrollRaf = 0

    const tick = () => {
      c.x += (t.x - c.x) * 0.32
      c.y += (t.y - c.y) * 0.32
      root.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`
      raf = Math.abs(t.x - c.x) > 0.1 || Math.abs(t.y - c.y) > 0.1 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const evaluate = (target: Element | null) => {
      const native = !!html.dataset.model // over a 3D model → system grab cursor
      root.classList.toggle('is-hidden', native || !seen)
      const lab = !native && target ? target.closest<HTMLElement>('[data-cursor-label]') : null
      if (lab) {
        const next: Label = { text: lab.dataset.cursorLabel || '', icon: lab.dataset.cursorIcon === 'up' ? 'up' : 'eye' }
        setLabel((prev) => (prev.text === next.text && prev.icon === next.icon ? prev : next))
      }
      root.classList.toggle('is-label', !!lab)
      root.classList.toggle('is-link', !lab && !!target?.closest(INTERACTIVE))
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      t.x = e.clientX
      t.y = e.clientY
      if (!seen) {
        seen = true
        c.x = t.x
        c.y = t.y
        root.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`
      }
      evaluate(e.target as Element | null)
      kick()
    }
    const reevaluate = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        if (seen) evaluate(document.elementFromPoint(t.x, t.y))
      })
    }
    const onDown = () => root.classList.add('is-down')
    const onUp = () => root.classList.remove('is-down')
    const onLeave = () => root.classList.add('is-hidden')
    const onEnter = () => seen && evaluate(document.elementFromPoint(t.x, t.y))

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('scroll', reevaluate, { passive: true, capture: true })
    window.addEventListener(MODEL_CURSOR_EVENT, reevaluate)
    html.addEventListener('mouseleave', onLeave)
    html.addEventListener('mouseenter', onEnter)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', reevaluate, true)
      window.removeEventListener(MODEL_CURSOR_EVENT, reevaluate)
      html.removeEventListener('mouseleave', onLeave)
      html.removeEventListener('mouseenter', onEnter)
      html.classList.remove('cur-on')
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scrollRaf)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="cur is-hidden" ref={rootRef} aria-hidden="true">
      <div className="cur__dot" />
      <div className="cur__pill">
        <Icon name={label.icon} />
        <span>{label.text}</span>
      </div>
    </div>
  )
}
