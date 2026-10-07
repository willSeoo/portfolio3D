import { useMemo } from 'react'
import * as THREE from 'three'
import type { ModelShowcaseItem } from '../types'
import { roundedFaceGeometry, roundedSlabGeometry } from './geometry'

// a hue sweep that also nods to the ID card's palette (salmon + teal)
const COLORS = ['#e8553f', '#f08a5d', '#f2b84b', '#e6d768', '#8ec47a', '#3fa7a0', '#4a8fd6', '#6e63c9', '#c85fa0']

/**
 * Graphic design = a colour-swatch fan: a stack of long paper strips riveted at one end and
 * spread open, each with a block of colour and a white label area (two grey "text" bars).
 * Generic fan — no brand marks. Both sides carry the colour so it reads from behind too.
 */
export function SwatchFanModel({ size }: { item: ModelShowcaseItem; size: number }) {
  const L = size // strip length
  const w = L * 0.2 // strip width
  const t = L * 0.012 // strip thickness
  const po = L * 0.05 // rivet distance from the strip's end
  const count = COLORS.length
  const spread = 84 // total opening angle, degrees
  const zStep = t * 1.3

  const slab = useMemo(() => roundedSlabGeometry(w, L, t, w * 0.3, t * 0.3), [w, L, t])
  const faceH = L * 0.56
  const face = useMemo(() => roundedFaceGeometry(w * 0.84, faceH, w * 0.16), [w, faceH])
  const bar = useMemo(() => roundedFaceGeometry(w * 0.52, L * 0.014, L * 0.007), [w, L])
  const barShort = useMemo(() => roundedFaceGeometry(w * 0.34, L * 0.014, L * 0.007), [w, L])

  const stripMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5f3ef', roughness: 0.8 }), [])
  const barMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c3c7ce', roughness: 0.9 }), [])
  const rivetMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8d9099', metalness: 0.9, roughness: 0.3 }), [])
  const colorMats = useMemo(() => COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 })), [])

  const eps = 0.0004
  const topMargin = L * 0.05
  const faceCY = L - po - topMargin - faceH / 2 // colour block centre, in strip-local y (origin = rivet)
  const barY1 = L - po - topMargin - faceH - L * 0.07
  const barY2 = barY1 - L * 0.035
  const pivotY = -L / 2 + po - L * 0.02
  const depth = (count - 1) * zStep + t
  const zMid = ((count - 1) * zStep) / 2

  return (
    <group>
      {COLORS.map((_, i) => {
        const angle = (i - (count - 1) / 2) * (spread / (count - 1))
        return (
          <group key={i} position={[0, pivotY, i * zStep - zMid]} rotation={[0, 0, (-angle * Math.PI) / 180]}>
            <mesh geometry={slab} material={stripMat} position={[0, L / 2 - po, 0]} />
            {/* colour block, front and back */}
            <mesh geometry={face} material={colorMats[i]} position={[0, faceCY, t / 2 + eps]} />
            <mesh geometry={face} material={colorMats[i]} position={[0, faceCY, -(t / 2 + eps)]} rotation={[0, Math.PI, 0]} />
            {/* label "text" bars */}
            <mesh geometry={bar} material={barMat} position={[0, barY1, t / 2 + eps]} />
            <mesh geometry={barShort} material={barMat} position={[-w * 0.09, barY2, t / 2 + eps]} />
          </group>
        )
      })}
      {/* the rivet that holds the fan together */}
      <mesh material={rivetMat} position={[0, pivotY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[w * 0.085, w * 0.085, depth + t * 1.5, 24]} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} material={rivetMat} position={[0, pivotY, side * (depth / 2 + t * 0.4)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[w * 0.17, w * 0.17, t * 0.9, 28]} />
        </mesh>
      ))}
    </group>
  )
}
