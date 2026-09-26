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

  const bodyGeo = useMemo(() => new RoundedBoxGeometry(width, height, depth, 4, width * 0.16), [width, height, depth])
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#1c1e22', metalness: 0.6, roughness: 0.35, clearcoat: 0.4 }), [])

  const screenTexture = useScreenTexture(item.thumbnail, item.title, item.tone)
  const screenW = width * 0.88
  const screenH = height * 0.94
  const screenZ = depth / 2 + 0.002

  return (
    <group>
      <mesh geometry={bodyGeo} material={bodyMat} />
      <mesh position={[0, 0, screenZ]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshStandardMaterial map={screenTexture} roughness={0.25} metalness={0.05} emissive="#ffffff" emissiveMap={screenTexture} emissiveIntensity={0.25} />
      </mesh>
      {/* camera notch */}
      <mesh position={[0, height * 0.44, screenZ + 0.001]}>
        <circleGeometry args={[width * 0.025, 24]} />
        <meshStandardMaterial color="#05060a" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* home indicator */}
      <mesh position={[0, -height * 0.44, screenZ + 0.001]}>
        <planeGeometry args={[width * 0.28, height * 0.006]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}
