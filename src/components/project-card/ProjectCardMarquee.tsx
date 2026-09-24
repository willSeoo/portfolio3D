import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { projects as defaultProjects } from '../../data/projects'
import { ProjectCard } from './ProjectCard'
import type { ImageStyle, Project } from './types'
import { useMarquee } from './useMarquee'
import './ProjectCard.css'

// Design widths at a 1440px-wide row; everything scales with the row width.
// Sized like a real card sitting in your hand, not a poster.
const DEFAULT_WIDTH: Record<ImageStyle, number> = {
  landscape: 360,
  portrait: 360,
  square: 390,
  arch: 360,
  pill: 360,
  cut: 345,
}

interface Props {
  projects?: Project[]
  /** px per second at a 1440px-wide row */
  speed?: number
  /** space between cards in px at a 1440px-wide row */
  gap?: number
  /** full turns per minute for the continuous spin */
  spinRpm?: number
}

export function ProjectCardMarquee({ projects = defaultProjects, speed = 26, gap = 80, spinRpm = 2.2 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [vw, setVw] = useState(0)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => setVw(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = Math.min(1.3, Math.max(0.6, vw / 1440))
  const g = Math.min(gap * scale, vw * 0.12)

  // Repeat the set until the row is long enough to loop without gaps.
  const items = useMemo(() => {
    if (!vw) return []
    const set = projects.map((p) => ({ p, w: Math.round(Math.min((p.layout?.width ?? DEFAULT_WIDTH[p.imageStyle]) * scale, vw * 0.74)) }))
    const setLen = set.reduce((sum, i) => sum + i.w + g, 0)
    const pad = Math.max(...set.map((i) => i.w)) + g
    const repeats = reduced ? 1 : Math.max(2, Math.ceil((vw + 2 * pad) / setLen))
    return Array.from({ length: repeats }, (_, r) => set.map((i) => ({ ...i, key: `${i.p.href}-${r}`, clone: r > 0 }))).flat()
  }, [projects, vw, scale, g, reduced])

  const widths = useMemo(() => items.map((i) => i.w), [items])

  useMarquee(trackRef, itemRefs, {
    widths,
    gap: g,
    viewport: vw,
    speed: speed * scale,
    spinDegPerSec: (spinRpm * 360) / 60,
    startIndex: Math.floor(projects.length / 2),
    enabled: !reduced,
  })

  return (
    <div ref={rootRef} className={`pcm${reduced ? ' pcm--static' : ''}`}>
      <ul ref={trackRef} className="pcm__track" aria-label="Selected projects">
        {items.map((it, i) => (
          <li
            key={it.key}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            className="pcm__item"
            style={{ width: it.w }}
          >
            <ProjectCard project={it.p} decorative={it.clone} />
          </li>
        ))}
      </ul>
    </div>
  )
}
