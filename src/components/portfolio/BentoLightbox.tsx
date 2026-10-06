import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { BentoItem } from './bentoData'
import { CATEGORY_LABEL } from './bentoData'
import { GlobeCanvas } from './globe/GlobeCanvas'
import { GlobeInfo } from './globe/GlobeInfo'

const DURATION = 560
const PANEL_ASPECT = 1.59 // the reference panel is ~836 × 527
const CAPTION_RESERVE = 150 // room kept under the panel for the text block

interface Props {
  item: BentoItem
  originEl: HTMLElement
  onClosed: () => void
}

function targetRect(vw: number, vh: number) {
  let w = Math.min(vw * 0.9, 900)
  let h = w / PANEL_ASPECT
  const maxH = Math.max(vh - CAPTION_RESERVE - 48, 220)
  if (h > maxH) {
    h = maxH
    w = h * PANEL_ASPECT
  }
  const top = Math.max((vh - (h + CAPTION_RESERVE * 0.75)) / 2, 24)
  return { left: (vw - w) / 2, top, width: w, height: h }
}

/**
 * Opens a bento card into a large centred panel over a blurred, washed-out page — the
 * panel grows out of the card's own rectangle (FLIP-style) and shrinks back into it on close.
 */
export function BentoLightbox({ item, originEl, onClosed }: Props) {
  const [origin] = useState(() => {
    const r = originEl.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  })
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const closeBtn = useRef<HTMLButtonElement>(null)
  const timer = useRef<number>(0)
  const closingRef = useRef(false)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  const target = useMemo(() => targetRect(vp.w, vp.h), [vp])

  // Stable identity on purpose: the key/resize effect below must not re-run (and wipe the
  // close timer) just because we flipped into the closing state.
  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    setOpen(false)
    timer.current = window.setTimeout(() => onClosedRef.current(), DURATION)
  }, [])

  // mount → next frames → open (so the browser has painted the "from" state first)
  useEffect(() => {
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setOpen(true)
        closeBtn.current?.focus({ preventScroll: true })
      })
    })
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [])

  // Escape closes. (Separate from the effect below: `close` changes identity the moment
  // closing starts, and re-running a combined effect used to clear the close timer — the
  // overlay then never unmounted and the whole page stayed dead.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // mount/unmount only: lock page scroll, track the viewport, hand focus back.
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden' // page stays put under the blur
    return () => {
      window.removeEventListener('resize', onResize)
      document.documentElement.style.overflow = prev
      window.clearTimeout(timer.current)
      originEl.focus?.({ preventScroll: true })
    }
  }, [originEl])

  // on close, shrink back into wherever the card is *now*
  const from = closing && originEl.isConnected
    ? (() => {
        const r = originEl.getBoundingClientRect()
        return { left: r.left, top: r.top, width: r.width, height: r.height }
      })()
    : origin
  const box = open ? target : from

  return createPortal(
    <div className="pf-lb" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className={`pf-lb__backdrop${open ? ' is-open' : ''}`} onClick={close} />

      <div
        className={`pf-lb__panel${open ? ' is-open' : ''}`}
        style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
      >
        {item.kind === 'globe' ? (
          <>
            <GlobeCanvas />
            <GlobeInfo />
          </>
        ) : item.kind === 'video' ? (
          <video src={item.src} poster={item.poster} autoPlay loop muted playsInline controls />
        ) : (
          <img src={item.src} alt={item.title} draggable={false} />
        )}
        <button ref={closeBtn} type="button" className="pf-lb__close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className={`pf-lb__caption${open ? ' is-open' : ''}`}
        style={{ left: target.left, top: target.top + target.height + 22, width: target.width }}
      >
        <p>
          <strong>
            {item.title} — {CATEGORY_LABEL[item.category]}, {item.year}.
          </strong>{' '}
          {item.blurb}
        </p>
        {item.href && (
          <a href={item.href} className="pf-lb__open" aria-label={`Open ${item.title}`}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M7 17 L17 7 M9 7 H17 V15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>,
    document.body,
  )
}
