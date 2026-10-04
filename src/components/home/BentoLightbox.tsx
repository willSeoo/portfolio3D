import { useEffect } from 'react'
import type { BentoItem } from './bentoData'

export function BentoLightbox({ item, onClose }: { item: BentoItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
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
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="bento-lightbox__media">
          {item.media.kind === 'video' ? (
            <video src={item.media.src} controls autoPlay playsInline className="bento-lightbox__video" />
          ) : (
            <img src={item.media.src} alt={item.title} className="bento-lightbox__image" />
          )}
        </div>
        <div className="bento-lightbox__info">
          <span className="bento-lightbox__category">{item.category}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </div>
    </div>
  )
}
