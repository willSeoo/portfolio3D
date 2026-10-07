import type { Ref } from 'react'
import type { BentoCategory } from './bentoData'

export type NavKey = 'home' | BentoCategory

const LINKS: Array<{ key: NavKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'motion', label: 'Motion' },
  { key: 'uiux', label: 'UI/UX' },
  { key: 'graphic', label: 'Graphic' },
  { key: 'engineering', label: 'Engineering' },
]

interface Props {
  /** The page drives `--np` (0 → 1) and `--nav-final` on this element while you scroll. */
  navRef: Ref<HTMLElement>
  active: NavKey
  onNavigate: (key: NavKey) => void
}

/**
 * Starts as the airy full-width header over the hero, then — as the hero flies into the
 * grid — compacts into a floating bar that is just a little wider than the bento grid
 * and stays stuck to the top. All the interpolation is CSS (`--np`), see portfolio.css.
 */
export function Navbar({ navRef, active, onNavigate }: Props) {
  return (
    <header className="pf-nav" ref={navRef}>
      <div className="pf-nav__bar">
        <a
          href="#home"
          className="pf-nav__logo"
          aria-label="Home"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('home')
          }}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M12 2 L14.2 9.2 L21.5 9.2 L15.6 13.7 L17.8 21 L12 16.5 L6.2 21 L8.4 13.7 L2.5 9.2 L9.8 9.2 Z" />
          </svg>
        </a>

        <nav className="pf-nav__links">
          {LINKS.map(({ key, label }) => (
            <a
              key={key}
              href={`#${key}`}
              className={`pf-nav__link${active === key ? ' pf-nav__link--active' : ''}`}
              aria-current={active === key ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(key)
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="pf-nav__actions">
          <a href="/blog" className="pf-nav__pill pf-nav__pill--ghost">
            Blog
          </a>
          <a href="/contact" className="pf-nav__pill pf-nav__pill--solid">
            Contact <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </header>
  )
}
