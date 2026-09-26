import { useEffect, useState } from 'react'
import * as THREE from 'three'

function placeholderTexture(label: string, tone: string): THREE.CanvasTexture {
  const w = 512
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, tone)
  g.addColorStop(1, '#20242c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '500 30px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Your thumbnail here', w / 2, h / 2 - 10)
  ctx.font = '20px system-ui, sans-serif'
  ctx.globalAlpha = 0.65
  ctx.fillText(label, w / 2, h / 2 + 26)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Loads `src` as a texture for a screen plane; falls back to a generated
 * placeholder (and stays on it) if `src` is missing or fails to load.
 * Swap in a real image any time by changing `thumbnail` in data.ts.
 */
export function useScreenTexture(src: string | undefined, label: string, tone = '#3a4250'): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(() => placeholderTexture(label, tone))

  useEffect(() => {
    if (!src) {
      setTexture(placeholderTexture(label, tone))
      return
    }
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.load(
      src,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        setTexture(tex)
      },
      undefined,
      () => {
        if (!cancelled) setTexture(placeholderTexture(label, tone))
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return texture
}
