import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { useScreenTexture } from './useScreenTexture'

/** A simple phone mockup: body + a screen plane carrying the project thumbnail. */
export function PhoneModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const height = size
  const width = height * 0.47
  const depth = width * 0.09

  // Modern flagship-phone proportions: slimmer bezel, tighter corner radius,
  // matte titanium-ish body — no brand logo anywhere on it.
  const bodyGeo = useMemo(() => new RoundedBoxGeometry(width, height, depth, 4, width * 0.12), [width, height, depth])
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#242427', metalness: 0.55, roughness: 0.42, clearcoat: 0.3 }), [])

  const screenTexture = useScreenTexture(item.thumbnail, item.title, item.tone)
  const screenW = width * 0.9
  const screenH = height * 0.96
  const screenZ = depth / 2 + 0.002

  const islandW = width * 0.24
  const islandH = width * 0.065
  const islandGeo = useMemo(
    () => new RoundedBoxGeometry(islandW, islandH, 0.006, 3, islandH / 2),
    [islandW, islandH],
  )

  return (
    <group>
      <mesh geometry={bodyGeo} material={bodyMat} />
      <mesh position={[0, 0, screenZ]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshStandardMaterial map={screenTexture} roughness={0.25} metalness={0.05} emissive="#ffffff" emissiveMap={screenTexture} emissiveIntensity={0.25} />
      </mesh>
      {/* dynamic-island-style pill cutout, modern-flagship look, no logo */}
      <mesh geometry={islandGeo} position={[0, height * 0.43, screenZ + 0.0015]}>
        <meshStandardMaterial color="#05060a" roughness={0.35} metalness={0.1} />
      </mesh>
      {/* home indicator */}
      <mesh position={[0, -height * 0.44, screenZ + 0.001]}>
        <planeGeometry args={[width * 0.28, height * 0.006]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}
