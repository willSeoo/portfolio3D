import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { ModelShowcaseItem } from '../types'
import { heroZoom } from '../heroZoom'
import { setModelCursor } from '../../cursor/cursorBus'
import { CardModel } from './CardModel'
import { OldPCModel } from './OldPCModel'
import { PhoneModel } from './PhoneModel'
import { useGrabRotate } from './useGrabRotate'

// Each model type gets its own height budget (relative to the stage's visible
// height) since a phone reads very differently from a boxy CRT at the same size.
const HEIGHT_FRACTION: Record<ModelShowcaseItem['model'], number> = {
  card: 0.53,
  phone: 0.75,
  oldpc: 0.57,
}

/**
 * The stage reserves a fixed amount of space for the nav/caption, so on short (laptop) screens
 * the models end up proportionally smaller than on a big monitor. Grow them as the window gets
 * shorter: nothing extra from ~1080px tall and up, up to +28% at ~700px.
 */
function laptopBoost() {
  const vh = typeof window === 'undefined' ? 1080 : window.innerHeight
  return 1 + 0.28 * Math.min(1, Math.max(0, (1080 - vh) / 380))
}

interface Props {
  item: ModelShowcaseItem
  onOpenPopup: () => void
}

export function ModelStage({ item, onOpenPopup }: Props) {
  const { viewport } = useThree()
  useThree((st) => st.size) // re-render on window resize so the boost below stays current
  const fraction = Math.min(HEIGHT_FRACTION[item.model] * laptopBoost(), 0.86)
  const zoomRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { onPointerDown, dragging } = useGrabRotate(groupRef, onOpenPopup)
  const [hovered, setHovered] = useState(false)
  // heroZoom is driven by the scroll transition (1 = fullscreen hero, <1 when docked in its card)
  // (capped so a tall model like the phone can't outgrow the canvas and get its ends cut off)
  useFrame(() => zoomRef.current?.scale.setScalar(Math.min(heroZoom.value, 0.88 / fraction)))
  const size = viewport.height * fraction

  return (
    <group ref={zoomRef}>
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation()
        setModelCursor('grabbing')
        onPointerDown(e.nativeEvent)
      }}
      onPointerUp={() => {
        setModelCursor(hovered ? 'grab' : null)
      }}
      onPointerOver={() => {
        setHovered(true)
        if (!dragging.current) setModelCursor('grab')
      }}
      onPointerOut={() => {
        setHovered(false)
        if (!dragging.current) setModelCursor(null)
      }}
    >
      {item.model === 'card' && <CardModel item={item} size={size} />}
      {item.model === 'phone' && <PhoneModel item={item} size={size} />}
      {item.model === 'oldpc' && <OldPCModel item={item} size={size} />}
    </group>
    </group>
  )
}
