import * as THREE from 'three'
import { TEX_H, TEX_W, roundRectPath } from '../project-card-3d/textureUtils'

const CORNER = TEX_W * 0.018

/** ATM/bank-card front: chip, embossed number, name, expiry, an abstract (non-brand) mark. */
export function buildFrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, TEX_W, TEX_H)
  roundRectPath(ctx, 0, 0, TEX_W, TEX_H, CORNER)
  ctx.save()
  ctx.clip()

  const bg = ctx.createLinearGradient(0, 0, TEX_W, TEX_H)
  bg.addColorStop(0, '#1b2430')
  bg.addColorStop(0.55, '#222c3a')
  bg.addColorStop(1, '#141a22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // faint diagonal texture lines, so the metal doesn't read as flat
  ctx.globalAlpha = 0.05
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  for (let x = -TEX_H; x < TEX_W; x += 26) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + TEX_H, TEX_H)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const pad = TEX_W * 0.065

  // chip
  const chipW = TEX_W * 0.11
  const chipH = chipW * 0.72
  const chipX = pad
  const chipY = TEX_H * 0.24
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH)
  chipGrad.addColorStop(0, '#e8d38a')
  chipGrad.addColorStop(1, '#b9964f')
  roundRectPath(ctx, chipX, chipY, chipW, chipH, chipW * 0.14)
  ctx.fillStyle = chipGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1.5
  for (let i = 1; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(chipX + (chipW / 3) * i, chipY)
    ctx.lineTo(chipX + (chipW / 3) * i, chipY + chipH)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(chipX, chipY + chipH / 2)
  ctx.lineTo(chipX + chipW, chipY + chipH / 2)
  ctx.stroke()

  // abstract mark, top right (two soft blended rings — deliberately not a real card-network logo)
  const markX = TEX_W - pad - TEX_W * 0.09
  const markY = TEX_H * 0.2
  const r = TEX_W * 0.045
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = 'rgba(120,170,255,0.55)'
  ctx.beginPath()
  ctx.arc(markX, markY, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,190,120,0.55)'
  ctx.beginPath()
  ctx.arc(markX + r * 0.9, markY, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  // card number
  ctx.fillStyle = '#eef1f5'
  const numberText = '4129   8830   5217   0043'
  let numSize = TEX_W * 0.05
  ctx.letterSpacing = `${TEX_W * 0.006}px`
  ctx.font = `500 ${numSize}px 'Courier New', monospace`
  while (ctx.measureText(numberText).width > TEX_W - pad * 2 && numSize > TEX_W * 0.03) {
    numSize -= TEX_W * 0.002
    ctx.font = `500 ${numSize}px 'Courier New', monospace`
  }
  ctx.textBaseline = 'alphabetic'
  const numY = TEX_H * 0.58
  ctx.fillText(numberText, pad, numY)
  ctx.letterSpacing = '0px'

  // name + expiry
  ctx.globalAlpha = 0.85
  ctx.font = `${TEX_W * 0.032}px system-ui, sans-serif`
  ctx.fillText('WILLI PRATAMA', pad, TEX_H * 0.85)
  ctx.font = `${TEX_W * 0.024}px system-ui, sans-serif`
  ctx.globalAlpha = 0.6
  const expiry = 'VALID THRU 09/30'
  const ew = ctx.measureText(expiry).width
  ctx.fillText(expiry, TEX_W - pad - ew, TEX_H * 0.85)
  ctx.globalAlpha = 1

  ctx.restore()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Back: no card-back convention to follow here — just a free, generative-feeling piece of art. */
export function buildBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, TEX_W, TEX_H)
  roundRectPath(ctx, 0, 0, TEX_W, TEX_H, CORNER)
  ctx.save()
  ctx.clip()

  const bg = ctx.createLinearGradient(0, 0, TEX_W, TEX_H)
  bg.addColorStop(0, '#ff8a5c')
  bg.addColorStop(0.45, '#f5567a')
  bg.addColorStop(1, '#6d4fe0')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  const blobs: [number, number, number, string][] = [
    [TEX_W * 0.18, TEX_H * 0.3, TEX_W * 0.26, 'rgba(255,255,255,0.28)'],
    [TEX_W * 0.72, TEX_H * 0.68, TEX_W * 0.3, 'rgba(255,255,255,0.2)'],
    [TEX_W * 0.85, TEX_H * 0.18, TEX_W * 0.16, 'rgba(255,230,150,0.35)'],
    [TEX_W * 0.32, TEX_H * 0.82, TEX_W * 0.2, 'rgba(90,40,160,0.35)'],
  ]
  ctx.globalCompositeOperation = 'overlay'
  for (const [x, y, rad, color] of blobs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'

  // a few thin arcs for movement/energy
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 3
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(TEX_W * 0.5, TEX_H * 1.1, TEX_W * (0.55 + i * 0.09), Math.PI * 1.12, Math.PI * 1.55)
    ctx.stroke()
  }

  ctx.restore()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
