import { useEffect, useState } from 'react'

/** Top nav bar, styled after the reference: logo — links — Blog + primary CTA pill.
 *  Hoisted to the page level so it persists across the hero and the Bento grid;
 *  once the page scrolls, it lifts slightly, tightens, and its width matches
 *  the Bento grid's max-width. */
export function Navbar() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`sc-nav-dock${compact ? ' sc-nav-dock--compact' : ''}`}>
      <header className="sc-nav">
        <a href="/" className="sc-nav__logo" aria-label="Home">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12 2 L14.2 9.2 L21.5 9.2 L15.6 13.7 L17.8 21 L12 16.5 L6.2 21 L8.4 13.7 L2.5 9.2 L9.8 9.2 Z" />
          </svg>
        </a>

        <nav className="sc-nav__links">
          <a href="#home" className="sc-nav__link sc-nav__link--active">
            Home
          </a>
          <a href="#work" className="sc-nav__link">
            Work
          </a>
          <a href="#fun" className="sc-nav__link">
            Fun
          </a>
          <a href="#philosophy" className="sc-nav__link">
            Philosophy
          </a>
        </nav>

        <div className="sc-nav__actions">
          <a href="/blog" className="sc-nav__pill sc-nav__pill--ghost">
            Blog
          </a>
          <a href="/contact" className="sc-nav__pill sc-nav__pill--solid">
            Contact <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
    </div>
  )
}
