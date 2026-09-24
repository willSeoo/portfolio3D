import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Writes the cursor position (-1..1) to --nx / --ny on the element.
 * CSS turns those into tilt, parallax and shadow shift, so React never re-renders.
 * Mouse only: touch devices skip it entirely.
 */
export function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || reduced) return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--nx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3))
        el.style.setProperty('--ny', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3))
        el.dataset.tracking = 'true'
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(raf)
      el.dataset.tracking = 'false'
      el.style.setProperty('--nx', '0')
      el.style.setProperty('--ny', '0')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref])
}
