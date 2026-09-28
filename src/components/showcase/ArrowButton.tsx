interface Props {
  direction: 'left' | 'right'
  onClick: () => void
  label: string
}

/** Borderless "play button" style triangle — no background chrome, just the glyph. */
export function ArrowButton({ direction, onClick, label }: Props) {
  return (
    <button type="button" className={`sc-arrow sc-arrow--${direction}`} onClick={onClick} aria-label={label}>
      <span className="sc-arrow__face">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d={direction === 'left' ? 'M16 4 L6 12 L16 20 Z' : 'M8 4 L18 12 L8 20 Z'} fill="currentColor" />
        </svg>
      </span>
    </button>
  )
}
