import type { EmbedShowcaseItem } from './types'

/**
 * A direct translation of Sketchfab's own embed snippet into JSX. Drop a new
 * `EmbedShowcaseItem` in data.ts with a fresh `embedUrl`/attribution to swap
 * models — nothing else needs to change.
 *
 * Heads up: this is a cross-origin iframe, so our page cannot see clicks
 * that land inside it (that's the browser's doing, not a bug here) — that's
 * why every slide, this one included, has its own "View case study" pill in
 * the caption below the stage as the reliable way to open the popup.
 */
export function SketchfabEmbed({ item, onOpen }: { item: EmbedShowcaseItem; onOpen: () => void }) {
  return (
    <div className="sc-embed-wrapper">
      <iframe
        title={item.embedTitle}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={item.embedUrl}
        className="sc-embed-iframe"
      />
      <button type="button" className="sc-embed-open" onClick={onOpen} aria-label="View case study">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
      </button>
      <p className="sc-embed-credit">
        <a href={item.sourceUrl} target="_blank" rel="noreferrer noopener nofollow">
          {item.embedTitle}
        </a>{' '}
        by{' '}
        <a href={item.embedAuthorUrl} target="_blank" rel="noreferrer noopener nofollow">
          {item.embedAuthor}
        </a>{' '}
        on{' '}
        <a href="https://sketchfab.com" target="_blank" rel="noreferrer noopener nofollow">
          Sketchfab
        </a>
      </p>
    </div>
  )
}
