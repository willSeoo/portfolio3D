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
  phone: 0.78,
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
  const size_ = useThree((st) => st.size) // also re-renders on window resize, keeping the boost current
  const fraction = Math.min(HEIGHT_FRACTION[item.model] * laptopBoost(), 0.86)

  // The canvas is taller than the stage (see ShowcaseScene): size and centre the model as if it
  // still only had the stage — the space the nav (6.5rem) and caption (9rem) reserve is excluded.
  const rem = typeof window === 'undefined' ? 16 : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const stagePx = Math.max(size_.height - 15.5 * rem, size_.height * 0.4)
  const worldPerPx = viewport.height / size_.height
  const lift = 1.25 * rem * worldPerPx // stage centre sits 1.25rem above the canvas centre
  const zoomRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { onPointerDown, dragging } = useGrabRotate(groupRef, onOpenPopup)
  const [hovered, setHovered] = useState(false)
  // heroZoom is driven by the scroll transition (1 = fullscreen hero, <1 when docked in its card)
  // (capped so a tall model like the phone can't outgrow the canvas and get its ends cut off)
  useFrame(() => zoomRef.current?.scale.setScalar(Math.min(heroZoom.value, 0.88 / fraction)))
  const size = stagePx * worldPerPx * fraction

  return (
    <group position={[0, lift, 0]}>
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
    </group>
  )
}
