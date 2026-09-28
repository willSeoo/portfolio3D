interface Props {
  direction: 'left' | 'right'
  onClick: () => void
  label: string
}

export function ArrowButton({ direction, onClick, label }: Props) {
  return (
    <button type="button" className={`sc-arrow sc-arrow--${direction}`} onClick={onClick} aria-label={label}>
      <span className="sc-arrow__face">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d={direction === 'left' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  )
}
