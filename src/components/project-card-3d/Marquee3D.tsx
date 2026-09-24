import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { projects as defaultProjects } from '../../data/projects'
import type { Project } from '../project-card/types'
import { Card3D } from './Card3D'

interface Props {
  projects?: Project[]
  /** world units per second the row drifts right to left */
  speed?: number
  /** card height as a fraction of the canvas's visible height */
  heightFraction?: number
  /** full turns per minute for each card's own continuous spin */
  spinRpm?: number
}

export function Marquee3D({ projects = defaultProjects, speed = 0.55, heightFraction = 0.7, spinRpm = 2.6 }: Props) {
  const { viewport } = useThree()
  const groupRefs = useRef<(THREE.Group | null)[]>([])
  const activeIds = useRef<Set<string>>(new Set())
  const offset = useRef(0)
  const currentSpeed = useRef(0)

  // Size off the canvas's *height* first (it's a short, wide strip), then derive
  // width from the card's own aspect ratio — matching a fixed number of "visible"
  // cards by dividing the width instead ignores how tall the strip actually is,
  // and ends up oversizing every card.
  const cardHeight = viewport.height * heightFraction
  const cardWidth = cardHeight * 1.586
  const gap = cardWidth * 0.26
  const depth = Math.max(cardWidth * 0.018, 0.012)

  const items = useMemo(() => {
    const setLen = (cardWidth + gap) * projects.length
    const pad = cardWidth + gap
    const repeats = Math.max(2, Math.ceil((viewport.width + 2 * pad) / setLen))
    return Array.from({ length: repeats }, (_, r) => projects.map((p, i) => ({ project: p, key: `${p.href}-${r}`, i: r * projects.length + i }))).flat()
  }, [projects, cardWidth, gap, viewport.width])

  const lefts = useMemo(() => items.map((_, i) => i * (cardWidth + gap)), [items, cardWidth, gap])
  const total = (cardWidth + gap) * items.length
  const pad = cardWidth + gap

  useEffect(() => {
    offset.current = lefts[Math.floor(items.length / 2)] ?? 0
  }, [lefts, items.length])

  const onActiveChange = (id: string, active: boolean) => {
    if (active) activeIds.current.add(id)
    else activeIds.current.delete(id)
  }

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 20)
    const target = activeIds.current.size > 0 ? 0 : speed
    currentSpeed.current += (target - currentSpeed.current) * Math.min(1, d * 8)
    offset.current += currentSpeed.current * d
    for (let i = 0; i < items.length; i++) {
      const g = groupRefs.current[i]
      if (!g) continue
      const x = ((((lefts[i] - offset.current + pad) % total) + total) % total) - pad - viewport.width / 2 + cardWidth / 2
      g.position.x = x
    }
  })

  const spinSpeed = (spinRpm * Math.PI * 2) / 60

  return (
    <group>
      {items.map((it, i) => (
        <Card3D
          key={it.key}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
          project={it.project}
          width={cardWidth}
          depth={depth}
          spinSpeed={spinSpeed}
          onActiveChange={onActiveChange}
        />
      ))}
    </group>
  )
}
