import { useEffect } from 'react'
import type { ShowcaseItem } from './types'
import { playClose, playConfirm } from './sound'

interface Props {
  item: ShowcaseItem
  onClose: () => void
}

/** "See the full thing?" — X closes, O opens item.href. */
export function ConfirmPopup({ item, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClose()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleConfirm = () => {
    playConfirm()
    window.location.href = item.href
  }
  const handleClose = () => {
    playClose()
    onClose()
  }

  return (
    <div className="sc-popup__backdrop" onClick={handleClose}>
      <div className="sc-popup" onClick={(e) => e.stopPropagation()}>
        <p className="sc-popup__eyebrow">
          {item.category} · {item.year}
        </p>
        <h3>{item.title}</h3>
        <p className="sc-popup__prompt">Want to see the full thing?</p>
        <div className="sc-popup__actions">
          <button type="button" className="sc-popup__btn sc-popup__btn--x" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="sc-popup__btn sc-popup__btn--o" onClick={handleConfirm} aria-label="Open">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
