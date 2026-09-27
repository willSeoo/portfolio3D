import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'

const UP = new THREE.Vector3(0, 1, 0)
const RIGHT = new THREE.Vector3(1, 0, 0)
const SENSITIVITY = 0.0072
const DAMPING = 0.94
const MIN_VELOCITY = 0.02
const CLICK_DIST = 6 // px — under this, a pointerdown+up pair counts as a click, not a drag
const CLICK_MS = 500
const IDLE_DELAY = 500 // ms of being fully settled before the idle turn resumes
const IDLE_SPEED = 0.16 // rad/sec — a slow, deliberate turn, not a spin

/**
 * Grab-and-spin: drag rotates the object freely on world axes, release lets
 * it coast to a stop, and once it's been still for a moment it slowly turns
 * on its own (paused instantly the moment it's grabbed again). Also reports
 * a click (near-zero movement, released quickly) separately from a drag.
 */
export function useGrabRotate(targetRef: RefObject<THREE.Object3D | null>, onClick: () => void) {
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const down = useRef({ x: 0, y: 0, t: 0 })
  const moved = useRef(0)
  const velocity = useRef({ x: 0, y: 0 })
  const quat = useRef(new THREE.Quaternion())
  const settledAt = useRef(performance.now())

  useEffect(() => {
    quat.current = new THREE.Quaternion()
    velocity.current = { x: 0, y: 0 }
    settledAt.current = performance.now()
  }, [targetRef])

  const applyDelta = (dx: number, dy: number) => {
    const yaw = new THREE.Quaternion().setFromAxisAngle(UP, dx * SENSITIVITY)
    const pitch = new THREE.Quaternion().setFromAxisAngle(RIGHT, dy * SENSITIVITY)
    quat.current.premultiply(yaw).premultiply(pitch)
    targetRef.current?.quaternion.copy(quat.current)
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
