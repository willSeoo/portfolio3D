import { useEffect, useState } from 'react'
import * as THREE from 'three'

function placeholderTexture(label: string, tone: string, aspect: number): THREE.CanvasTexture {
  const base = 768
  const w = aspect >= 1 ? base : Math.round(base * aspect)
  const h = aspect >= 1 ? Math.round(base / aspect) : base
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
  ctx.textAlign = 'center'
  ctx.font = `500 ${Math.round(w * 0.075)}px system-ui, sans-serif`
  ctx.fillText('Your thumbnail here', w / 2, h / 2 - 10)
  ctx.font = `${Math.round(w * 0.05)}px system-ui, sans-serif`
  ctx.globalAlpha = 0.65
  ctx.fillText(label, w / 2, h / 2 + w * 0.08)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Crop-to-fill (like CSS object-fit: cover) for an image mapped onto a plane of a given aspect. */
function fitCover(tex: THREE.Texture, targetAspect: number) {
  const img = tex.image as { width: number; height: number } | undefined
  if (!img?.width || !img?.height) return
  const imgAspect = img.width / img.height
  tex.repeat.set(1, 1)
  tex.offset.set(0, 0)
  if (imgAspect > targetAspect) {
    tex.repeat.x = targetAspect / imgAspect
    tex.offset.x = (1 - tex.repeat.x) / 2
  } else {
    tex.repeat.y = imgAspect / targetAspect
    tex.offset.y = (1 - tex.repeat.y) / 2
  }
}

/**
 * Loads `src` as a texture for a screen plane, cropped to fill `aspect`
 * (width / height of the screen); falls back to a generated placeholder if
 * `src` is missing or fails to load. Swap in a real image any time by
 * changing `thumbnail` in data.ts.
 */
export function useScreenTexture(src: string | undefined, label: string, tone = '#3a4250', aspect = 1): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(() => placeholderTexture(label, tone, aspect))

  useEffect(() => {
    if (!src) {
      setTexture(placeholderTexture(label, tone, aspect))
      return
    }
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.load(
      src,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        fitCover(tex, aspect)
        setTexture(tex)
      },
      undefined,
      () => {
        if (!cancelled) setTexture(placeholderTexture(label, tone, aspect))
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, aspect])

  return texture
}
