import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Writes the element's own rendered width/height in px to --pc-w / --pc-h.
 * The 3D edge panels need real pixel lengths (translateZ can't take a %),
 * and the card's width is fluid, so this is how they find out their size.
 */
export function useSize(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { inlineSize, blockSize } = entry.borderBoxSize?.[0] ?? { inlineSize: entry.contentRect.width, blockSize: entry.contentRect.height }
      el.style.setProperty('--pc-w', `${inlineSize}px`)
      el.style.setProperty('--pc-h', `${blockSize}px`)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
}
