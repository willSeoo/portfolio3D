import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { projects as defaultProjects } from '../../data/projects'
import type { Project } from '../project-card/types'
import { Marquee3D } from './Marquee3D'
import { StudioEnvironment } from './StudioEnvironment'

interface Props {
  projects?: Project[]
  speed?: number
  heightFraction?: number
  spinRpm?: number
  /** background colour behind the cards */
  background?: string
}

/** Drop-in replacement for the CSS ProjectCardMarquee: same data, real WebGL cards. */
export function ProjectCardScene({ projects = defaultProjects, speed, heightFraction, spinRpm, background = '#f4f2ee' }: Props) {
  return (
    <div style={{ width: '100%', height: 'clamp(20rem, 46vw, 26rem)' }}>
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
          <Marquee3D projects={projects} speed={speed} heightFraction={heightFraction} spinRpm={spinRpm} />
        </Suspense>
      </Canvas>
    </div>
  )
}
