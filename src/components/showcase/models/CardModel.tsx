import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { useScreenTexture } from './useScreenTexture'

/** A playful ID-card / driver's-license style model — photo box, name, fields, signature. */
export function CardModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const width = size * 1.586
  const height = size
  const depth = Math.max(width * 0.012, 0.006)
  const artTexture = useScreenTexture(item.thumbnail, item.title, item.tone)

  const geometry = useMemo(() => new RoundedBoxGeometry(width, height, depth, 3, Math.min(width, height) * 0.05), [width, height, depth])

  const front = useMemo(() => buildFrontTexture(item.title, item.tone ?? '#2a3444'), [item.title, item.tone])

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#e5e2da', metalness: 0.15, roughness: 0.55 })
    const frontMat = new THREE.MeshPhysicalMaterial({ map: front, metalness: 0.02, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 })
    const backMat = new THREE.MeshPhysicalMaterial({ metalness: 0.05, roughness: 0.5, clearcoat: 0.25, color: '#1b1e24' })
    return [edge, edge, edge, edge, frontMat, backMat]
  }, [front])

  // small inset "art" plane on the back, showing the project thumbnail like a photo tucked in a wallet
  const artSize = Math.min(width, height) * 0.5

  return (
    <group>
      <mesh geometry={geometry} material={materials} />
      <mesh position={[0, height * 0.06, -depth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[artSize * 1.5, artSize * 0.94]} />
        <meshStandardMaterial map={artTexture} roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  )
}

/** Deterministic little ID-number generator so the same project always shows the same "code". */
function idCodeFor(title: string): string {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0
  const digits = (h % 900000000) + 100000000
  return String(digits).replace(/(\d{2})(\d{2})(\d{4})/, '$1-$2-$3')
}

function buildFrontTexture(title: string, tone: string): THREE.CanvasTexture {
  const W = 1024
  const H = Math.round(W / 1.586)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const accent = new THREE.Color(tone || '#8fb2c9')
  const accentHex = `#${accent.getHexString()}`
  const accentDark = accent.clone().lerp(new THREE.Color('#000000'), 0.55)

  // paper-white body, like a real ID/license card
  ctx.fillStyle = '#f6f4ee'
  ctx.fillRect(0, 0, W, H)

  // playful diagonal guilloché-style hatching, very faint (license-card texture)
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = accentHex
  ctx.lineWidth = 1.5
  for (let x = -H; x < W; x += 14) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + H, H)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // header stripe
  const headerH = H * 0.22
  ctx.fillStyle = accentHex
  ctx.fillRect(0, 0, W, headerH)
  ctx.fillStyle = accentDark.getStyle()
  ctx.fillRect(0, headerH, W, H * 0.02)

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${W * 0.05}px system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillText('PORTFOLIO ID', W * 0.055, headerH * 0.42)
  ctx.font = `500 ${W * 0.024}px system-ui, sans-serif`
  ctx.globalAlpha = 0.85
  ctx.fillText('CLASS: CREATOR', W * 0.055, headerH * 0.78)
  ctx.globalAlpha = 1
  ctx.textBaseline = 'alphabetic'

  const pad = W * 0.055
  const photoW = W * 0.26
  const photoH = H - headerH - H * 0.09 - pad
  const photoY = headerH + H * 0.05
  roundRect(ctx, pad, photoY, photoW, photoH, W * 0.02)
  const photoGrad = ctx.createLinearGradient(pad, photoY, pad, photoY + photoH)
  photoGrad.addColorStop(0, accentDark.getStyle())
  photoGrad.addColorStop(1, '#20242c')
  ctx.fillStyle = photoGrad
  ctx.fill()
  // simple silhouette placeholder (swap for a real photo later)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath()
  ctx.arc(pad + photoW / 2, photoY + photoH * 0.36, photoW * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(pad + photoW / 2, photoY + photoH * 0.92, photoW * 0.38, photoH * 0.32, 0, Math.PI, 0)
  ctx.fill()

  // field labels + values, license-style
  const fx = pad + photoW + W * 0.045
  const fields: [string, string][] = [
    ['NAME', title.toUpperCase()],
    ['ROLE', 'DESIGNER / DEVELOPER'],
    ['ID NO.', idCodeFor(title)],
  ]
  let fy = photoY + H * 0.03
  const lineGap = photoH * 0.29
  ctx.fillStyle = accentDark.getStyle()
  for (const [label, value] of fields) {
    ctx.globalAlpha = 0.65
    ctx.font = `600 ${W * 0.02}px system-ui, sans-serif`
    ctx.fillText(label, fx, fy)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#232323'
    ctx.font = `600 ${W * 0.03}px system-ui, sans-serif`
    ctx.fillText(value, fx, fy + W * 0.038)
    ctx.fillStyle = accentDark.getStyle()
    fy += lineGap
  }

  // signature, script-style using the title as a flourish
  ctx.globalAlpha = 0.8
  ctx.font = `italic 500 ${W * 0.034}px 'Segoe Script', cursive, system-ui`
  ctx.fillStyle = '#232323'
  ctx.fillText(title, fx, H - pad * 0.9)
  ctx.globalAlpha = 0.5
  ctx.font = `${W * 0.016}px system-ui, sans-serif`
  ctx.fillText('AUTHORIZED SIGNATURE', fx, H - pad * 0.9 + W * 0.022)
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
