import { Canvas, useThree } from '@react-three/fiber'
import { Suspense } from 'react'
import { StudioEnvironment } from '../project-card-3d/StudioEnvironment'
import { SpinCard } from './SpinCard'

function Sized() {
  const { viewport } = useThree()
  const cardHeight = viewport.height * 0.56
  const cardWidth = cardHeight * 1.586
  const depth = Math.max(cardWidth * 0.02, 0.016)
  return <SpinCard width={cardWidth} depth={depth} />
}

interface Props {
  background?: string
}

/** One card, centered, grab-and-spin. Nothing else on the stage. */
export function SpinCardScene({ background = '#f4f2ee' }: Props) {
  return (
    <div style={{ width: '100%', height: '100vh', touchAction: 'none' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 4.2], fov: 32 }}
        style={{ background }}
      >
        <Suspense fallback={null}>
          <StudioEnvironment />
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 5]} intensity={0.9} />
          <directionalLight position={[-4, -2, 2]} intensity={0.25} />
          <Sized />
        </Suspense>
      </Canvas>
    </div>
  )
}
