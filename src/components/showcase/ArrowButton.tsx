interface Props {
  direction: 'left' | 'right'
  onClick: () => void
  label: string
}

// A "play button" triangle with softly rounded corners (a thick round-joined
// stroke in the same color as the fill does the rounding). No background.
const PATH = {
  right: 'M9 5.5 L19.5 12 L9 18.5 Z',
  left: 'M15 5.5 L4.5 12 L15 18.5 Z',
}

export function ArrowButton({ direction, onClick, label }: Props) {
  const id = `sc-arrow-grad-${direction}`
  return (
    <button type="button" className={`sc-arrow sc-arrow--${direction}`} onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 24 24" className="sc-arrow__icon" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9dce1" />
            <stop offset="1" stopColor="#b6bac1" />
          </linearGradient>
        </defs>
        <path d={PATH[direction]} fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth="3.2" strokeLinejoin="round" />
        {/* soft highlight along the top edge */}
        <path
          d={direction === 'right' ? 'M9.6 7.4 L17 11.6' : 'M14.4 7.4 L7 11.6'}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
