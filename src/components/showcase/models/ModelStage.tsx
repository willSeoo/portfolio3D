import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { ModelShowcaseItem } from '../types'
import { heroZoom } from '../heroZoom'
import { CardModel } from './CardModel'
import { OldPCModel } from './OldPCModel'
import { PhoneModel } from './PhoneModel'
import { useGrabRotate } from './useGrabRotate'

// Each model type gets its own height budget (relative to the stage's visible
// height) since a phone reads very differently from a boxy CRT at the same size.
const HEIGHT_FRACTION: Record<ModelShowcaseItem['model'], number> = {
  card: 0.56,
  phone: 0.74,
  oldpc: 0.57,
}

interface Props {
  item: ModelShowcaseItem
  onOpenPopup: () => void
}

export function ModelStage({ item, onOpenPopup }: Props) {
  const { viewport } = useThree()
  const zoomRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { onPointerDown, dragging } = useGrabRotate(groupRef, onOpenPopup)
  const [hovered, setHovered] = useState(false)
  // heroZoom is driven by the scroll transition (1 = fullscreen hero, <1 when docked in its card)
  useFrame(() => zoomRef.current?.scale.setScalar(heroZoom.value))
  const size = viewport.height * HEIGHT_FRACTION[item.model]

  return (
    <group ref={zoomRef}>
    <group
      ref={groupRef}
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
      {item.model === 'card' && <CardModel item={item} size={size} />}
      {item.model === 'phone' && <PhoneModel item={item} size={size} />}
      {item.model === 'oldpc' && <OldPCModel item={item} size={size} />}
    </group>
    </group>
  )
}
