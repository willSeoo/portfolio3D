import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'
import { StudioEnvironment } from '../project-card-3d/StudioEnvironment'
import { CardModel } from '../showcase/models/CardModel'
import type { ModelShowcaseItem } from '../showcase/types'

function SlowSpin({ item }: { item: ModelShowcaseItem }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += Math.min(dt, 0.05) * 0.22
  })
  return (
    <group ref={ref} rotation={[0.12, -0.35, 0]}>
      <CardModel item={item} size={1.6} />
    </group>
  )
}

const heroItem: ModelShowcaseItem = {
  kind: 'model',
  model: 'card',
  id: 'about',
  title: 'About Me',
  category: 'Identity',
  year: '2026',
  href: '/about',
}

/** The hero's 3D content — a slow auto-turn, no drag (this element also has to receive scroll). */
export function HeroObjectScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 4.6], fov: 32 }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.72
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <StudioEnvironment intensity={0.8} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[3, 4, 5]} intensity={0.75} />
      <directionalLight position={[-4, -2, 2]} intensity={0.2} />
      <SlowSpin item={heroItem} />
    </Canvas>
  )
}
