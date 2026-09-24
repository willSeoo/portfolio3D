import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Project } from '../project-card/types'
import { TEX_H, TEX_W, cutPath, loadImage, pillPath, roundRectPath, wrapText } from './textureUtils'

export interface CardFaces {
  front: THREE.CanvasTexture
  back: THREE.CanvasTexture
  /** Normalized (0..1, three.js v-up) rect of the back face's CTA hit area. */
  ctaUV: { uMin: number; uMax: number; vMin: number; vMax: number }
}

const CORNER = TEX_W * 0.018

function toUV(x: number, y: number, w: number, h: number) {
  return { uMin: x / TEX_W, uMax: (x + w) / TEX_W, vMin: 1 - (y + h) / TEX_H, vMax: 1 - y / TEX_H }
}

async function drawFront(project: Project): Promise<THREE.CanvasTexture> {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, TEX_W, TEX_H)
  roundRectPath(ctx, 0, 0, TEX_W, TEX_H, CORNER)
  ctx.save()
  ctx.clip()
  ctx.fillStyle = project.tone ?? '#e9e6df'
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  const pad = TEX_W * 0.06
  const artH = TEX_H * 0.58
  const artW = TEX_W - pad * 2
  const artX = pad
  const artY = TEX_H * 0.08
  ctx.save()
  if (project.imageStyle === 'pill') pillPath(ctx, artX, artY, artW, artH)
  else if (project.imageStyle === 'cut') cutPath(ctx, artX, artY, artW, artH)
  else roundRectPath(ctx, artX, artY, artW, artH, TEX_W * 0.012)
  ctx.clip()
  ctx.fillStyle = `color-mix(in srgb, ${project.tone ?? '#e9e6df'} 80%, #000 14%)`
  ctx.fillRect(artX, artY, artW, artH)
  const img = await loadImage(project.image)
  if (img) {
    const scale = Math.max(artW / img.width, artH / img.height)
    const iw = img.width * scale
    const ih = img.height * scale
    ctx.drawImage(img, artX + (artW - iw) / 2, artY + (artH - ih) / 2, iw, ih)
  }
  ctx.restore()

  const ink = '#151515'
  ctx.fillStyle = ink
  ctx.font = `500 ${TEX_W * 0.052}px system-ui, sans-serif`
  ctx.textBaseline = 'alphabetic'
  const nameY = TEX_H * 0.83
  ctx.fillText(project.title, pad, nameY)
  ctx.globalAlpha = 0.7
  ctx.font = `${TEX_W * 0.03}px system-ui, sans-serif`
  const subY = nameY + TEX_W * 0.045
  ctx.fillText(project.category, pad, subY)
  const yearW = ctx.measureText(project.year).width
  ctx.fillText(project.year, TEX_W - pad - yearW, subY)
  ctx.globalAlpha = 1
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

async function drawBack(project: Project): Promise<{ texture: THREE.CanvasTexture; ctaRect: [number, number, number, number] }> {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, TEX_W, TEX_H)
  roundRectPath(ctx, 0, 0, TEX_W, TEX_H, CORNER)
  ctx.save()
  ctx.clip()
  const ink = '#151515'
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  const pad = TEX_W * 0.065
  const paper = '#f5f3ee'
  ctx.fillStyle = paper
  ctx.globalAlpha = 0.7
  ctx.font = `${TEX_W * 0.028}px system-ui, sans-serif`
  ctx.textBaseline = 'alphabetic'
  const topY = TEX_H * 0.14
  ctx.fillText(project.category, pad, topY)
  const yearW = ctx.measureText(project.year).width
  ctx.fillText(project.year, TEX_W - pad - yearW, topY)
  ctx.globalAlpha = 1

  ctx.fillStyle = paper
  ctx.font = `500 ${TEX_W * 0.062}px system-ui, sans-serif`
  const titleY = topY + TEX_W * 0.075
  ctx.fillText(project.title, pad, titleY)

  ctx.globalAlpha = 0.78
  ctx.font = `${TEX_W * 0.027}px system-ui, sans-serif`
  const lineH = TEX_W * 0.038
  const lines = wrapText(ctx, project.description, TEX_W - pad * 2, 3)
  lines.forEach((line, i) => ctx.fillText(line, pad, titleY + TEX_W * 0.06 + i * lineH))
  ctx.globalAlpha = 1

  let tx = pad
  const toolsY = titleY + TEX_W * 0.06 + lines.length * lineH + TEX_W * 0.03
  const chipH = TEX_W * 0.045
  ctx.font = `${TEX_W * 0.024}px system-ui, sans-serif`
  for (const tool of project.tools) {
    const tw = ctx.measureText(tool).width + TEX_W * 0.036
    roundRectPath(ctx, tx, toolsY, tw, chipH, chipH / 2)
    ctx.strokeStyle = 'rgba(245,243,238,0.35)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = paper
    ctx.fillText(tool, tx + TEX_W * 0.018, toolsY + chipH * 0.68)
    tx += tw + TEX_W * 0.016
  }

  const ctaW = TEX_W * 0.34
  const ctaH = TEX_H * 0.12
  const ctaX = pad
  const ctaY = TEX_H - TEX_H * 0.1 - ctaH
  roundRectPath(ctx, ctaX, ctaY, ctaW, ctaH, TEX_W * 0.01)
  ctx.fillStyle = project.tone ?? '#e9e6df'
  ctx.fill()
  ctx.fillStyle = ink
  ctx.font = `500 ${TEX_W * 0.028}px system-ui, sans-serif`
  ctx.fillText('View Case Study \u2192', ctaX + TEX_W * 0.02, ctaY + ctaH * 0.63)
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return { texture, ctaRect: [ctaX, ctaY, ctaW, ctaH] }
}

const cache = new Map<string, Promise<CardFaces>>()

async function build(project: Project): Promise<CardFaces> {
  const [front, backResult] = await Promise.all([drawFront(project), drawBack(project)])
  const [x, y, w, h] = backResult.ctaRect
  return { front, back: backResult.texture, ctaUV: toUV(x, y, w, h) }
}

/** Bakes (and caches, by href) the front/back textures for one project. Resolves once, off the main render path. */
export function useCardFaces(project: Project): CardFaces | null {
  const [faces, setFaces] = useState<CardFaces | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    let entry = cache.get(project.href)
    if (!entry) {
      entry = build(project)
      cache.set(project.href, entry)
    }
    entry.then((f) => {
      if (mounted.current) setFaces(f)
    })
    return () => {
      mounted.current = false
    }
  }, [project])
  return faces
}
