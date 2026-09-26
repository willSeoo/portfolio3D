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

/**
 * Grab-and-spin, same as the standalone spin card, plus a click callback:
 * release with barely any movement and quickly enough, and onClick fires
 * instead of leaving residual spin.
 */
export function useGrabRotate(targetRef: RefObject<THREE.Object3D | null>, onClick: () => void) {
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const down = useRef({ x: 0, y: 0, t: 0 })
  const moved = useRef(0)
  const velocity = useRef({ x: 0, y: 0 })
  const quat = useRef(new THREE.Quaternion())

  // Reset orientation when the target itself changes (i.e. a new model mounted).
  useEffect(() => {
    quat.current = new THREE.Quaternion()
    velocity.current = { x: 0, y: 0 }
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
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      const elapsed = performance.now() - down.current.t
      if (moved.current < CLICK_DIST && elapsed < CLICK_MS) {
        velocity.current = { x: 0, y: 0 }
        onClick()
      }
      void e
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

  useFrame(() => {
    if (dragging.current) return
    const { x, y } = velocity.current
    if (Math.abs(x) < MIN_VELOCITY && Math.abs(y) < MIN_VELOCITY) return
    applyDelta(x, y)
    velocity.current = { x: x * DAMPING, y: y * DAMPING }
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
