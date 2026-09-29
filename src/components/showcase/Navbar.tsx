/** Top nav bar, styled after the reference: logo — links — Blog + primary CTA pill. */
export function Navbar() {
  return (
    <header className="sc-nav">
      <a href="/" className="sc-nav__logo" aria-label="Home">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
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
  )
}
