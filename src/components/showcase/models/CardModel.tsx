import { useMemo } from 'react'
import * as THREE from 'three'
import type { ModelShowcaseItem } from '../types'
import { roundedFaceGeometry, roundedSlabGeometry } from './geometry'
import { useIdCardTextures } from './useIdCardTextures'

/**
 * Your ID card: a thin plastic slab with real rounded corners, a printed
 * front and a printed back. What's printed is drawn in drawIdCard.ts from
 * idCard.config.ts — edit those, not this file.
 */
export function CardModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const height = size
  const width = size * 1.586
  const depth = width * 0.0105 // thin — close to a real card's ~0.9%
  const bevel = depth * 0.3
  const radius = height * 0.062

  const slab = useMemo(() => roundedSlabGeometry(width, height, depth, radius, bevel), [width, height, depth, radius, bevel])
  const face = useMemo(() => roundedFaceGeometry(width - 2 * bevel, height - 2 * bevel, radius - bevel), [width, height, radius, bevel])

  const { front, back } = useIdCardTextures(item)

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8e4d6', roughness: 0.5, metalness: 0.05 }), [])
  const frontMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: front, roughness: 0.5, metalness: 0, specularIntensity: 0.45, clearcoat: 0.25, clearcoatRoughness: 0.3 }),
    [front],
  )
  const backMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: back, roughness: 0.5, metalness: 0, specularIntensity: 0.45, clearcoat: 0.25, clearcoatRoughness: 0.3 }),
    [back],
  )

  const eps = 0.0004
  return (
    <group>
      <mesh geometry={slab} material={edgeMat} />
      <mesh geometry={face} material={frontMat} position={[0, 0, depth / 2 + eps]} />
      <mesh geometry={face} material={backMat} position={[0, 0, -depth / 2 - eps]} rotation={[0, Math.PI, 0]} />
    </group>
  )
}
