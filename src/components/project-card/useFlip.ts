import { useCallback, useEffect, useRef, useState } from 'react'

export const FLIP_MS = 720

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Flip state with a lock so clicks during the animation are ignored. */
export function useFlip() {
  const [flipped, setFlipped] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const busy = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const ms = prefersReducedMotion() ? 0 : FLIP_MS

  const toggle = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setFlipped((f) => !f)
    setFlipping(true)
    timer.current = window.setTimeout(() => {
      busy.current = false
      setFlipping(false)
    }, ms + 30)
  }, [ms])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { flipped, flipping, toggle, ms }
}
