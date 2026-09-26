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
export function SketchfabEmbed({ item }: { item: EmbedShowcaseItem }) {
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
