import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildBackTexture, buildFrontTexture } from './buildFaces'
import { useDragRotate } from './useDragRotate'

interface Props {
  width: number
  depth: number
}

export function SpinCard({ width, depth }: Props) {
  const height = width / 1.586
  const groupRef = useRef<THREE.Group>(null)
  const { onPointerDown, dragging } = useDragRotate(groupRef)
  const [hovered, setHovered] = useState(false)

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#d8d5cd', metalness: 0.75, roughness: 0.3 })
    const front = new THREE.MeshPhysicalMaterial({
      map: buildFrontTexture(),
      transparent: true,
      metalness: 0.2,
      roughness: 0.3,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
    })
    const back = new THREE.MeshPhysicalMaterial({
      map: buildBackTexture(),
      transparent: true,
      metalness: 0.1,
      roughness: 0.35,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    })
    // BoxGeometry group order: +x, -x, +y, -y, +z(front), -z(back)
    return [edge, edge, edge, edge, front, back]
  }, [])

  return (
    <group ref={groupRef} rotation={[0.32, -0.5, 0]}>
      <mesh
        material={materials}
        onPointerDown={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'grabbing'
          onPointerDown(e.nativeEvent)
        }}
        onPointerUp={() => {
          document.body.style.cursor = hovered ? 'grab' : 'auto'
        }}
        onPointerOver={() => {
          setHovered(true)
          if (!dragging.current) document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          setHovered(false)
          if (!dragging.current) document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[width, height, depth]} />
      </mesh>
    </group>
  )
}
