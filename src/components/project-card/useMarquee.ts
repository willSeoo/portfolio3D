import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

interface Options {
  widths: number[] // width of every instance in the row (px)
  gap: number
  viewport: number
  speed: number // px per second, moving right to left
  spinDegPerSec: number // continuous Y-axis spin while a card isn't paused
  startIndex: number // instance that starts in the centre
  enabled: boolean
}

/**
 * Positions cards itself (translate3d) and writes --spin (deg) on each item.
 * No React re-renders per frame. The row eases to a stop while any card is
 * hovered or flipped; each card's own spin eases to the nearest upright
 * angle (a multiple of 360°) while *that* card is hovered or flipped, so its
 * face reads straight-on, and resumes spinning from there once released.
 */
export function useMarquee(
  track: RefObject<HTMLElement | null>,
  items: RefObject<(HTMLElement | null)[]>,
  { widths, gap, viewport, speed, spinDegPerSec, startIndex, enabled }: Options,
) {
  const offset = useRef<number | null>(null)
  const spin = useRef<number[]>([])

  useLayoutEffect(() => {
    const root = track.current
    if (!root || !enabled || !widths.length) return

    const lefts: number[] = []
    let total = 0
    for (const w of widths) {
      lefts.push(total)
      total += w + gap
    }
    const pad = Math.max(...widths) + gap
    if (offset.current === null) offset.current = lefts[startIndex] + widths[startIndex] / 2 - viewport / 2
    // Golden-angle stagger so the spins desync instead of all facing the same way at once.
    if (spin.current.length !== widths.length) {
      spin.current = widths.map((_, i) => (i * 137.5) % 360)
    }

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let visible = true
    let currentSpeed = 0
    let last = performance.now()
    let raf = 0

    const place = () => {
      const o = offset.current as number
      for (let i = 0; i < widths.length; i++) {
        const el = items.current[i]
        if (!el) continue
        const x = ((((lefts[i] - o + pad) % total) + total) % total) - pad
        el.style.transform = `translate3d(${x.toFixed(2)}px, -50%, 0)`
        el.style.setProperty('--spin', spin.current[i].toFixed(2))
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000
      last = now
      const anyPaused = canHover && root.querySelector('.pc:hover, .pc[data-flipped="true"]')
      currentSpeed += ((anyPaused ? 0 : speed) - currentSpeed) * Math.min(1, dt * 8)
      if (Math.abs(currentSpeed) > 0.01) offset.current = (offset.current as number) + currentSpeed * dt

      for (let i = 0; i < widths.length; i++) {
        const el = items.current[i]
        const paused = !!el && (el.matches(':hover') || !!el.querySelector('.pc[data-flipped="true"]'))
        if (paused) {
          // ease into the nearest upright angle rather than decelerating sharply,
          // so the stop reads as the card settling, not the animation cutting out
          const a = spin.current[i]
          const target = Math.round(a / 360) * 360
          spin.current[i] = a + (target - a) * Math.min(1, dt * 3.2)
        } else {
          spin.current[i] += spinDegPerSec * dt
        }
      }

      if (visible) place()
      raf = requestAnimationFrame(tick)
    }

    place()
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) place()
    })
    io.observe(root)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [track, items, widths, gap, viewport, speed, spinDegPerSec, startIndex, enabled])
}
