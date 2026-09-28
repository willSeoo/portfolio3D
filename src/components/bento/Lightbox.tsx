import { useEffect } from 'react'
import type { BentoItem } from './types'

interface Props {
  item: BentoItem
  onClose: () => void
}

/** Full-view popup: click a Bento card and its image/video opens large, centered, with a close control. */
export function Lightbox({ item, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="bento-lightbox__backdrop" onClick={onClose}>
      <div className="bento-lightbox" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="bento-lightbox__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        <div className="bento-lightbox__media">
          {item.media === 'video' ? (
            <video src={item.src} poster={item.poster} controls autoPlay playsInline />
          ) : (
            <img src={item.src} alt={item.title} />
          )}
        </div>
        <div className="bento-lightbox__caption">
          <p className="bento-lightbox__eyebrow">{item.category}</p>
          <h3>{item.title}</h3>
          {item.blurb && <p className="bento-lightbox__blurb">{item.blurb}</p>}
        </div>
      </div>
    </div>
  )
}
