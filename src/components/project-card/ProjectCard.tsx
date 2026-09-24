import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { ImageFrame } from './ImageFrame'
import type { ImageStyle, Project } from './types'
import { useFlip } from './useFlip'
import { useSize } from './useSize'
import { useTilt } from './useTilt'
import './ProjectCard.css'

const DEFAULT_RATIO: Record<ImageStyle, number> = {
  landscape: 1.2,
  portrait: 0.8,
  square: 0.95,
  arch: 0.85,
  pill: 1.25,
  cut: 1.2,
}

type CSSVars = CSSProperties & { [key: `--${string}`]: string | number }

/** `decorative` marks looped clones: hidden from assistive tech and skipped by Tab. */
export function ProjectCard({ project, decorative = false }: { project: Project; decorative?: boolean }) {
  const { title, category, year, image, description, tools, imageStyle, href, tone = '#e9e6df', layout } = project
  const ratio = layout?.ratio ?? DEFAULT_RATIO[imageStyle]
  const rootRef = useRef<HTMLElement>(null)
  const { flipped, flipping, toggle, ms } = useFlip()
  useTilt(rootRef)
  useSize(rootRef)

  const vars: CSSVars = {
    '--pc-ratio': ratio,
    '--pc-rot': layout?.rotate ?? 0,
    '--pc-tone': tone,
    '--pc-ms': `${ms}ms`,
  }

  return (
    <article
      ref={rootRef}
      className="pc"
      style={vars}
      data-shape={imageStyle}
      data-compact={ratio > 1}
      data-flipped={flipped}
      data-flipping={flipping}
      aria-hidden={decorative || undefined}
    >
      <div className="pc__pose">
      <div className="pc__tilt">
        <div className="pc__flip">
          {/* Thickness: the two edges an actual card would show side-on as it turns */}
          <div className="pc__edge pc__edge--right" aria-hidden="true" />
          <div className="pc__edge pc__edge--left" aria-hidden="true" />

          {/* Front */}
          <div className="pc__face pc__face--front" aria-hidden={flipped}>
            <button
              type="button"
              className="pc__hit"
              onClick={toggle}
              tabIndex={decorative || flipped ? -1 : 0}
              aria-label={`${title}, show details`}
            />
            <div className="pc__art">
              <ImageFrame src={image} alt={`${title} preview`} shape={imageStyle} />
            </div>
            <div className="pc__caption">
              <h3 className="pc__name">{title}</h3>
              <p className="pc__sub">
                <span>{category}</span>
                <span>{year}</span>
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="pc__face pc__face--back" aria-hidden={!flipped}>
            <button
              type="button"
              className="pc__hit"
              onClick={toggle}
              tabIndex={!decorative && flipped ? 0 : -1}
              aria-label={`${title}, flip back`}
            />
            <div className="pc__info">
              <div className="pc__head">
                <ImageFrame className="pc__mark" src={image} shape={imageStyle} />
                <p className="pc__meta">
                  <span>{category}</span>
                  <span>{year}</span>
                </p>
              </div>
              <h3 className="pc__title">{title}</h3>
              <p className="pc__desc">{description}</p>
              <ul className="pc__tools">
                {tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <a className="pc__cta" href={href} tabIndex={!decorative && flipped ? 0 : -1}>
                View Case Study →
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </article>
  )
}
