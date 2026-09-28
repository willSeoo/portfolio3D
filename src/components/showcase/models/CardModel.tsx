import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { useScreenTexture } from './useScreenTexture'

/** An ATM/bank-card style model — chip, embossed number, name, an abstract mark. */
export function CardModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const width = size * 1.586
  const height = size
  const depth = Math.max(width * 0.025, 0.012)
  const artTexture = useScreenTexture(item.thumbnail, item.title, item.tone)

  const geometry = useMemo(() => new RoundedBoxGeometry(width, height, depth, 3, Math.min(width, height) * 0.05), [width, height, depth])

  const front = useMemo(() => buildFrontTexture(item.title, item.tone ?? '#2a3444'), [item.title, item.tone])

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#d8d5cd', metalness: 0.75, roughness: 0.3 })
    const frontMat = new THREE.MeshPhysicalMaterial({ map: front, metalness: 0.15, roughness: 0.3, clearcoat: 0.65, clearcoatRoughness: 0.24 })
    const backMat = new THREE.MeshPhysicalMaterial({ metalness: 0.1, roughness: 0.4, clearcoat: 0.4, color: '#111418' })
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

function buildFrontTexture(title: string, tone: string): THREE.CanvasTexture {
  const W = 1024
  const H = Math.round(W / 1.586)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const tinted = new THREE.Color(tone).lerp(new THREE.Color('#1b2430'), 0.72)
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1b2430')
  bg.addColorStop(0.55, `#${tinted.getHexString()}`)
  bg.addColorStop(1, '#141a22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.globalAlpha = 0.05
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  for (let x = -H; x < W; x += 26) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + H, H)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const pad = W * 0.065
  const chipW = W * 0.11
  const chipH = chipW * 0.72
  const chipGrad = ctx.createLinearGradient(pad, H * 0.24, pad + chipW, H * 0.24 + chipH)
  chipGrad.addColorStop(0, '#e8d38a')
  chipGrad.addColorStop(1, '#b9964f')
  ctx.fillStyle = chipGrad
  roundRect(ctx, pad, H * 0.24, chipW, chipH, chipW * 0.14)
  ctx.fill()

  ctx.fillStyle = '#eef1f5'
  ctx.font = `500 ${W * 0.045}px 'Courier New', monospace`
  ctx.letterSpacing = `${W * 0.006}px`
  ctx.fillText('4129   8830   5217   0043', pad, H * 0.58)
  ctx.letterSpacing = '0px'

  ctx.globalAlpha = 0.85
  ctx.font = `${W * 0.032}px system-ui, sans-serif`
  ctx.fillText(title.toUpperCase(), pad, H * 0.85)
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
