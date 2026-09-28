import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'

const SENSITIVITY = 0.0072
const DAMPING = 0.94
const MIN_VELOCITY = 0.02
// Keep elevation short of the poles. Without this, a normal vertical drag can
// sail past +/-90° and the object flips direction mid-drag (classic "gimbal
// flip" disorientation) — clamping is what makes vertical drag feel like a
// bounded tilt (as in Sketchfab/orbit viewers) instead of a spin that can
// invert on you.
const MAX_ELEVATION = THREE.MathUtils.degToRad(85)
const CLICK_DIST = 6 // px — under this, a pointerdown+up pair counts as a click, not a drag
const CLICK_MS = 500
const IDLE_DELAY = 500 // ms of being fully settled before the idle turn resumes
const IDLE_SPEED = 0.16 // rad/sec — a slow, deliberate turn, not a spin

/**
 * Grab-and-spin: drag rotates the object, release lets it coast to a stop,
 * and once it's been still for a moment it slowly turns on its own (paused
 * instantly the moment it's grabbed again). Also reports a click (near-zero
 * movement, released quickly) separately from a drag.
 *
 * Rotation is tracked as two decoupled angles — azimuth (turn left/right)
 * and elevation (tilt up/down) — and rebuilt into a quaternion fresh every
 * frame (Euler order 'YXZ'), instead of composing deltas into a running
 * quaternion via premultiply. The old premultiply approach let the two axes
 * entangle: after enough turning, "drag up" would visually roll the object
 * instead of tilting it, which reads as broken/unnatural. Decoupled angles
 * behave like a standard product-viewer / orbit control — dragging right
 * always turns the same way, dragging up always tilts the same way, no
 * matter how the object is currently oriented — the "feels like Sketchfab"
 * behavior being asked for.
 */
export function useGrabRotate(targetRef: RefObject<THREE.Object3D | null>, onClick: () => void) {
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const down = useRef({ x: 0, y: 0, t: 0 })
  const moved = useRef(0)
  const velocity = useRef({ x: 0, y: 0 })
  const azimuth = useRef(0)
  const elevation = useRef(0)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const settledAt = useRef(performance.now())

  useEffect(() => {
    azimuth.current = 0
    elevation.current = 0
    velocity.current = { x: 0, y: 0 }
    settledAt.current = performance.now()
    targetRef.current?.quaternion.identity()
  }, [targetRef])

  const applyDelta = (dx: number, dy: number) => {
    azimuth.current += dx * SENSITIVITY
    elevation.current = THREE.MathUtils.clamp(elevation.current + dy * SENSITIVITY, -MAX_ELEVATION, MAX_ELEVATION)
    euler.current.set(elevation.current, azimuth.current, 0)
    targetRef.current?.quaternion.setFromEuler(euler.current)
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      moved.current += Math.abs(dx) + Math.abs(dy)
      applyDelta(dx, dy)
      velocity.current = { x: dx, y: dy }
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      const elapsed = performance.now() - down.current.t
      if (moved.current < CLICK_DIST && elapsed < CLICK_MS) {
        velocity.current = { x: 0, y: 0 }
        settledAt.current = performance.now()
        onClick()
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClick])

  useFrame((_, dt) => {
    if (dragging.current) return
    const { x, y } = velocity.current
    if (Math.abs(x) >= MIN_VELOCITY || Math.abs(y) >= MIN_VELOCITY) {
      applyDelta(x, y)
      velocity.current = { x: x * DAMPING, y: y * DAMPING }
      settledAt.current = performance.now()
      return
    }
    // fully settled — after a short pause, ease into a slow idle turn
    if (performance.now() - settledAt.current > IDLE_DELAY) {
      applyDelta(IDLE_SPEED * dt * (1 / SENSITIVITY), 0)
    }
  })

  const onPointerDown = (e: { clientX: number; clientY: number; pointerId: number; target: EventTarget | null }) => {
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
    down.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    moved.current = 0
    velocity.current = { x: 0, y: 0 }
    const el = e.target as Element | null
    el?.setPointerCapture?.(e.pointerId)
  }

  return { onPointerDown, dragging }
}
