import type { CSSProperties } from 'react'
import { projects as defaultProjects } from '../../data/projects'
import { ProjectCard } from './ProjectCard'
import type { Project } from './types'
import './ProjectCard.css'

type CSSVars = CSSProperties & { [key: `--${string}`]: string | number }

export function ProjectCardSection({ projects = defaultProjects }: { projects?: Project[] }) {
  return (
    <section className="pcs" aria-label="Selected projects">
      <ul className="pcs__grid">
        {projects.map((p) => {
          const l = p.layout
          const vars: CSSVars = {
            '--pcs-col': l?.colStart ?? 'auto',
            '--pcs-span': l?.colSpan ?? 4,
            '--pcs-dy': l?.dy ?? '0px',
          }
          return (
            <li key={p.href} className="pcs__item" style={vars}>
              <ProjectCard project={p} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
