import { useCallback, useEffect, useRef, useState } from 'react'
import { showcaseItems } from './data'
import { playSwitch } from './sound'

export type TransitionPhase = 'idle' | 'leaving' | 'entering'

export const LEAVE_MS = 220
export const ENTER_MS = 300

/** Index + the leave/enter transition state machine driving the stage's transform. */
export function useCarousel() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [direction, setDirection] = useState<1 | -1>(1)
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  const go = useCallback((dir: 1 | -1) => {
    if (busy.current) return
    busy.current = true
    setDirection(dir)
    setPhase('leaving')
    playSwitch(dir)
    const t1 = window.setTimeout(() => {
      setIndex((i) => (i + dir + showcaseItems.length) % showcaseItems.length)
      setPhase('entering')
      const t2 = window.setTimeout(() => {
        setPhase('idle')
        busy.current = false
      }, ENTER_MS)
      timers.current.push(t2)
    }, LEAVE_MS)
    timers.current.push(t1)
  }, [])

  const next = useCallback(() => go(1), [go])
  const prev = useCallback(() => go(-1), [go])

  return { index, item: showcaseItems[index], phase, direction, next, prev, isBusy: () => busy.current }
}
