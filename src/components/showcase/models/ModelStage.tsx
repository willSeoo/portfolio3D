import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { ModelShowcaseItem } from '../types'
import { CardModel } from './CardModel'
import { OldPCModel } from './OldPCModel'
import { PhoneModel } from './PhoneModel'
import { useGrabRotate } from './useGrabRotate'

// Each model type gets its own height budget (relative to the stage's visible
// height) since a phone reads very differently from a boxy CRT at the same size.
const HEIGHT_FRACTION: Record<ModelShowcaseItem['model'], number> = {
  card: 0.3,
  phone: 0.5,
  oldpc: 0.38,
}

interface Props {
  item: ModelShowcaseItem
  onOpenPopup: () => void
}

export function ModelStage({ item, onOpenPopup }: Props) {
  const { viewport } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const { onPointerDown } = useGrabRotate(groupRef, onOpenPopup)
  const size = viewport.height * HEIGHT_FRACTION[item.model]

  return (
    <group
      ref={groupRef}
      rotation={[0.28, -0.45, 0]}
      onPointerDown={(e) => {
        e.stopPropagation()
        onPointerDown(e.nativeEvent)
      }}
    >
      {item.model === 'card' && <CardModel item={item} size={size} />}
      {item.model === 'phone' && <PhoneModel item={item} size={size} />}
      {item.model === 'oldpc' && <OldPCModel item={item} size={size} />}
    </group>
  )
}
