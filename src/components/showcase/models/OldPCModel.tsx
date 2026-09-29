import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { useScreenTexture } from './useScreenTexture'

/** A chunky old CRT ("tabung") monitor mockup: deep beige body, recessed screen. */
export function OldPCModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const height = size
  const width = height * 1.12
  const depth = width * 0.82

  const bodyGeo = useMemo(() => new RoundedBoxGeometry(width, height, depth, 3, Math.min(width, height) * 0.06), [width, height, depth])
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9d3c3', roughness: 0.75, metalness: 0.05 }), [])

  const bezelW = width * 0.72
  const bezelH = height * 0.62
  const bezelGeo = useMemo(() => new RoundedBoxGeometry(bezelW, bezelH, depth * 0.14, 3, Math.min(bezelW, bezelH) * 0.08), [bezelW, bezelH, depth])
  const bezelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.55 }), [])
  const bezelZ = depth / 2 - depth * 0.02

  const screenW = bezelW * 0.82
  const screenH = bezelH * 0.78
  const screenTexture = useScreenTexture(item.thumbnail, item.title, item.tone, screenW / screenH)

  return (
    <group>
      <mesh geometry={bodyGeo} material={bodyMat} />
      <mesh geometry={bezelGeo} material={bezelMat} position={[0, height * 0.06, bezelZ]} />
      <mesh position={[0, height * 0.06, bezelZ + depth * 0.075]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshStandardMaterial map={screenTexture} roughness={0.35} metalness={0.1} emissive="#ffffff" emissiveMap={screenTexture} emissiveIntensity={0.18} />
      </mesh>
      {/* small power LED */}
      <mesh position={[width * 0.28, -height * 0.36, bezelZ + depth * 0.08]}>
        <circleGeometry args={[width * 0.012, 16]} />
        <meshStandardMaterial color="#5ee27a" emissive="#3fc65f" emissiveIntensity={1.2} />
      </mesh>
      {/* bottom bezel strip */}
      <mesh position={[0, -height * 0.4, bezelZ + depth * 0.06]}>
        <boxGeometry args={[bezelW * 0.9, height * 0.06, depth * 0.02]} />
        <meshStandardMaterial color="#c9c2ae" roughness={0.7} />
      </mesh>
    </group>
  )
}
