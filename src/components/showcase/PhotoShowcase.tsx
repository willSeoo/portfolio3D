import type { PhotoShowcaseItem } from './types'

/** Same box size/style the Sketchfab embed used — just a plain clickable photo. */
export function PhotoShowcase({ item, onOpen }: { item: PhotoShowcaseItem; onOpen: () => void }) {
  return (
    <div className="sc-embed-wrapper">
      <button type="button" className="sc-photo" onClick={onOpen} aria-label={`Open ${item.title}`}>
        <img src={item.src} alt={item.title} className="sc-embed-iframe" />
      </button>
    </div>
  )
}
