import { useFrame } from '@react-three/fiber'
import { forwardRef, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Project } from '../project-card/types'
import { useCardFaces } from './useCardFaces'

const AXIS = new THREE.Vector3(0.16, 1, 0.09).normalize()
const TAU = Math.PI * 2
const FLIP_MS = 700

interface Props {
  project: Project
  width: number
  depth: number
  spinSpeed: number // rad/sec
  onActiveChange: (id: string, active: boolean) => void
}

/** One physical card: a real extruded box, its own continuous spin, hover tilt/lift, and a click-flip. */
export const Card3D = forwardRef<THREE.Group, Props>(function Card3D({ project, width, depth, spinSpeed, onActiveChange }, outerRef) {
  const faces = useCardFaces(project)
  const height = width / 1.586

  const poseRef = useRef<THREE.Group>(null)
  const tiltRef = useRef<THREE.Group>(null)
  const liftRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  const spin = useRef(Math.random() * TAU)
  const hovered = useRef(false)
  const flipped = useRef(false)
  const flipProgress = useRef(0)
  const flipBusy = useRef(false)
  const targetTiltX = useRef(0)
  const targetTiltY = useRef(0)
  const targetLift = useRef(0)

  const setActive = (active: boolean) => onActiveChange(project.href, active)

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#d8d5cd', metalness: 0.7, roughness: 0.32 })
    const blank = new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.5, roughness: 0.4 })
    const front = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.15, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 })
    const back = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.15, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 })
    // BoxGeometry group order: +x, -x, +y, -y, +z(front), -z(back)
    return [edge, edge, blank, blank, front, back]
  }, [])

  useMemo(() => {
    if (!faces) return
    ;(materials[4] as THREE.MeshPhysicalMaterial).map = faces.front
    ;(materials[4] as THREE.MeshPhysicalMaterial).transparent = true
    ;(materials[4] as THREE.MeshPhysicalMaterial).needsUpdate = true
    ;(materials[5] as THREE.MeshPhysicalMaterial).map = faces.back
    ;(materials[5] as THREE.MeshPhysicalMaterial).transparent = true
    ;(materials[5] as THREE.MeshPhysicalMaterial).needsUpdate = true
  }, [faces, materials])

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 20)
    const paused = hovered.current || flipped.current
    if (paused) {
      const target = Math.round(spin.current / TAU) * TAU
      spin.current += (target - spin.current) * Math.min(1, d * 3.2)
    } else {
      spin.current += spinSpeed * d
    }
    poseRef.current?.quaternion.setFromAxisAngle(AXIS, spin.current)

    if (tiltRef.current) {
      tiltRef.current.rotation.x += (targetTiltY.current - tiltRef.current.rotation.x) * Math.min(1, d * 8)
      tiltRef.current.rotation.y += (targetTiltX.current - tiltRef.current.rotation.y) * Math.min(1, d * 8)
    }
    if (liftRef.current) {
      liftRef.current.position.z += (targetLift.current - liftRef.current.position.z) * Math.min(1, d * 8)
    }

    const flipTarget = flipped.current ? 1 : 0
    flipProgress.current += (flipTarget - flipProgress.current) * Math.min(1, d * (1000 / FLIP_MS) * 2.6)
    if (meshRef.current) meshRef.current.rotation.y = flipProgress.current * Math.PI
  })

  const handleClick = (e: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (flipBusy.current) return
    const faceIndex = e.face?.materialIndex
    if (faceIndex === 5 && faces) {
      const { uMin, uMax, vMin, vMax } = faces.ctaUV
      const uv = e.uv
      if (uv && uv.x >= uMin && uv.x <= uMax && uv.y >= vMin && uv.y <= vMax) {
        window.location.href = project.href
        return
      }
    }
    if (faceIndex === 4 || faceIndex === 5) {
      flipBusy.current = true
      flipped.current = !flipped.current
      setActive(hovered.current || flipped.current)
      window.setTimeout(() => {
        flipBusy.current = false
      }, FLIP_MS + 40)
    }
  }

  const handleOver = (e: import('@react-three/fiber').ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hovered.current = true
    setActive(true)
    document.body.style.cursor = 'pointer'
  }
  const handleOut = () => {
    hovered.current = false
    setActive(flipped.current)
    targetTiltX.current = 0
    targetTiltY.current = 0
    targetLift.current = 0
    document.body.style.cursor = 'auto'
  }
  const handleMove = (e: import('@react-three/fiber').ThreeEvent<PointerEvent>) => {
    if (!e.uv) return
    const nx = (e.uv.x - 0.5) * 2
    const ny = (e.uv.y - 0.5) * 2
    targetTiltX.current = nx * 0.34
    targetTiltY.current = ny * 0.22
    targetLift.current = 0.045
  }

  return (
    <group ref={outerRef}>
      <group ref={poseRef}>
        <group ref={tiltRef}>
          <group ref={liftRef}>
            <mesh
              ref={meshRef}
              material={materials}
              onClick={handleClick}
              onPointerOver={handleOver}
              onPointerOut={handleOut}
              onPointerMove={handleMove}
            >
              <boxGeometry args={[width, height, depth]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
})
