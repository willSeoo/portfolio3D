import { useState } from 'react'
import type { ImageStyle } from './types'

interface Props {
  src: string
  alt?: string
  shape: ImageStyle
  className?: string
}

/** One image treatment for every card: shape comes from data-shape, so no per-project components. */
export function ImageFrame({ src, alt = '', shape, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`pc-frame ${className}`} data-shape={shape}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
