import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'

const UP = new THREE.Vector3(0, 1, 0)
const RIGHT = new THREE.Vector3(1, 0, 0)
const SENSITIVITY = 0.0072
const DAMPING = 0.94
const MIN_VELOCITY = 0.02

/**
 * Grab-and-spin: drag rotates the object freely on world axes (not just Y), the card
 * never moves from its spot, and releasing lets it coast to a stop instead of stopping dead.
 */
export function useDragRotate(targetRef: RefObject<THREE.Object3D | null>) {
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const quat = useRef(new THREE.Quaternion())

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
      applyDelta(dx, dy)
      velocity.current = { x: dx, y: dy }
    }
    const onUp = () => {
      dragging.current = false
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
  }, [])

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
    velocity.current = { x: 0, y: 0 }
    const el = e.target as Element | null
    el?.setPointerCapture?.(e.pointerId)
  }

  return { onPointerDown, dragging }
}
