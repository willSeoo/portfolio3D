import type { IdCardConfig } from './idCard.config'

export const ID_W = 1024
export const ID_H = 646

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height)
  const iw = img.width * s
  const ih = img.height * s
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih)
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, font: (s: number) => string) {
  let s = size
  ctx.font = font(s)
  while (ctx.measureText(text).width > maxW && s > 14) {
    s -= 2
    ctx.font = font(s)
  }
  return s
}

function wave(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, amp: number, step: number) {
  ctx.beginPath()
  ctx.moveTo(x0, y)
  let up = true
  for (let x = x0; x < x1; x += step) {
    ctx.quadraticCurveTo(x + step / 2, y + (up ? -amp : amp), x + step, y)
    up = !up
  }
  ctx.stroke()
}

/** Deterministic pseudo-random so the barcode doesn't change between redraws. */
function bars(seed: string, count: number) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    out.push(1 + ((h >>> 0) % 4))
  }
  return out
}

function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  roundRect(ctx, x, y, w, h, 10)
  ctx.fill()
  const widths = bars(label, 60)
  const total = widths.reduce((a, b) => a + b * 2, 0)
  const unit = (w - 48) / total
  let cx = x + 24
  ctx.fillStyle = '#1b1b1b'
  widths.forEach((bw, i) => {
    const bwPx = bw * unit
    if (i % 2 === 0) ctx.fillRect(cx, y + 14, bwPx, h - 44)
    cx += bwPx + unit * (i % 2 === 0 ? 1 : 1.2)
  })
  ctx.font = '600 20px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(label, x + w / 2, y + h - 12)
  ctx.textAlign = 'left'
}

export function drawIdFront(canvas: HTMLCanvasElement, cfg: IdCardConfig, photo: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d')!
  const p = cfg.palette
  ctx.clearRect(0, 0, ID_W, ID_H)
  ctx.fillStyle = p.paper
  ctx.fillRect(0, 0, ID_W, ID_H)

  // faint tiled watermark, like a security pattern
  ctx.save()
  ctx.translate(ID_W / 2, ID_H / 2)
  ctx.rotate(-0.28)
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#6b6a5c'
  ctx.font = '700 32px Georgia, serif'
  const tile = `${cfg.name} ✦ `
  const tw = ctx.measureText(tile).width
  for (let row = 0, y = -520; y < 520; y += 44, row++) {
    for (let x = -780 - (row % 2) * (tw / 2); x < 780; x += tw) ctx.fillText(tile, x, y)
  }
  ctx.restore()

  // faint seal
  ctx.save()
  ctx.strokeStyle = 'rgba(61,138,143,0.18)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(ID_W * 0.68, ID_H * 0.66, 140, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(ID_W * 0.68, ID_H * 0.66, 112, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // corner stripes
  ctx.fillStyle = p.stripe
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(0, 24 + i * 30, 150, 16)
    ctx.fillRect(ID_W - 150, 24 + i * 30, 150, 16)
  }

  // header
  ctx.textAlign = 'center'
  ctx.fillStyle = p.ink
  const tSize = fit(ctx, cfg.state, 660, 92, (s) => `700 ${s}px Georgia, "Times New Roman", serif`)
  ctx.font = `700 ${tSize}px Georgia, "Times New Roman", serif`
  ctx.fillText(cfg.state, ID_W / 2, 112)
  ctx.font = '500 44px Georgia, "Times New Roman", serif'
  ctx.fillText(cfg.title, ID_W * 0.42, 168)
  ctx.textAlign = 'right'
  ctx.font = '700 26px Georgia, serif'
  ctx.fillText(cfg.classLabel, ID_W - 56, 156)
  ctx.textAlign = 'center'
  ctx.fillStyle = p.green
  ctx.font = '600 44px Georgia, serif'
  ctx.fillText(cfg.number, ID_W * 0.58, 214)
  ctx.textAlign = 'left'
  ctx.fillStyle = p.red
  ctx.font = '600 26px Georgia, serif'
  ctx.fillText(cfg.expires, 40, 186)

  // redacted-looking scribbles
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 3
  wave(ctx, ID_W * 0.4, ID_W - 50, 246, 7, 22)
  wave(ctx, ID_W * 0.4, ID_W - 130, 268, 7, 18)

  // photo
  const px = 32
  const py = 232
  const pw = 270
  const ph = 372
  ctx.fillStyle = p.frame
  roundRect(ctx, px, py, pw, ph, 12)
  ctx.fill()
  ctx.save()
  roundRect(ctx, px + 10, py + 10, pw - 20, ph - 20, 6)
  ctx.clip()
  if (photo) {
    cover(ctx, photo, px + 10, py + 10, pw - 20, ph - 20)
  } else {
    ctx.fillStyle = '#d3e6e3'
    ctx.fillRect(px, py, pw, ph)
    ctx.fillStyle = '#8fb5b3'
    ctx.beginPath()
    ctx.arc(px + pw / 2, py + ph * 0.42, 62, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(px + pw / 2, py + ph * 0.98, 112, 118, 0, Math.PI, 0)
    ctx.fill()
    ctx.fillStyle = '#4f7f80'
    ctx.font = '700 22px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('YOUR PHOTO', px + pw / 2, py + 52)
    ctx.textAlign = 'left'
  }
  ctx.restore()

  // details
  const tx = 334
  ctx.fillStyle = p.ink
  const nSize = fit(ctx, cfg.name, 640, 70, (s) => `700 ${s}px "Arial Narrow", Arial, sans-serif`)
  ctx.font = `700 ${nSize}px "Arial Narrow", Arial, sans-serif`
  ctx.fillText(cfg.name, tx, 336)
  cfg.addressLines.forEach((line, i) => {
    const s = fit(ctx, line, 660, 46, (sz) => `600 ${sz}px "Arial Narrow", Arial, sans-serif`)
    ctx.font = `600 ${s}px "Arial Narrow", Arial, sans-serif`
    ctx.fillText(line, tx, 390 + i * 46)
  })
  cfg.details.forEach((d, i) => {
    const s = fit(ctx, d.text, 660, 27, (sz) => `700 ${sz}px "Arial Narrow", Arial, sans-serif`)
    ctx.font = `700 ${s}px "Arial Narrow", Arial, sans-serif`
    ctx.fillStyle = d.color ?? p.ink
    ctx.fillText(d.text, tx, 486 + i * 33)
  })

  // signature
  ctx.fillStyle = '#1f2a44'
  ctx.font = 'italic 700 74px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive'
  ctx.fillText(cfg.signature, tx + 30, 606)
  ctx.strokeStyle = '#1f2a44'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(tx + 10, 618)
  ctx.quadraticCurveTo(tx + 250, 596, tx + 560, 616)
  ctx.stroke()
}

export function drawIdBack(canvas: HTMLCanvasElement, cfg: IdCardConfig, image: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d')!
  const p = cfg.palette
  ctx.clearRect(0, 0, ID_W, ID_H)

  if (image) {
    cover(ctx, image, 0, 0, ID_W, ID_H)
    const g = ctx.createLinearGradient(0, ID_H * 0.45, 0, ID_H)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, ID_W, ID_H)
  } else {
    const g = ctx.createLinearGradient(0, 0, ID_W, ID_H)
    g.addColorStop(0, p.backFrom)
    g.addColorStop(1, p.backTo)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, ID_W, ID_H)

    // playful shapes
    ctx.fillStyle = p.frame
    ctx.beginPath()
    ctx.arc(ID_W * 0.86, ID_H * 0.18, 210, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(243,238,223,0.9)'
    ctx.beginPath()
    ctx.arc(ID_W * 0.72, ID_H * 0.02, 90, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(28,28,28,0.18)'
    ctx.lineWidth = 4
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.arc(ID_W * 0.2, ID_H * 1.15, 180 + i * 46, Math.PI * 1.1, Math.PI * 1.9)
      ctx.stroke()
    }

    // headline + list
    ctx.fillStyle = p.ink
    ctx.font = '700 24px Georgia, serif'
    ctx.fillText(cfg.backHeadline, 56, 84)
    cfg.backLines.forEach((line, i) => {
      const s = fit(ctx, line, 520, 56, (sz) => `800 ${sz}px "Arial Narrow", Arial, sans-serif`)
      ctx.font = `800 ${s}px "Arial Narrow", Arial, sans-serif`
      ctx.fillText(line, 56, 160 + i * 64)
    })

    // polaroid placeholder for a photo of your own
    ctx.save()
    ctx.translate(ID_W * 0.78, ID_H * 0.62)
    ctx.rotate(-0.1)
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6
    ctx.fillStyle = '#fbf8ef'
    roundRect(ctx, -120, -150, 240, 290, 8)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#d3e6e3'
    ctx.fillRect(-100, -130, 200, 200)
    ctx.fillStyle = '#4f7f80'
    ctx.font = '700 20px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('YOUR PHOTO', 0, -22)
    ctx.fillText('HERE', 0, 4)
    ctx.textAlign = 'left'
    ctx.restore()
  }

  barcode(ctx, 48, ID_H - 150, 430, 104, cfg.number)
  ctx.fillStyle = image ? 'rgba(255,255,255,0.92)' : p.ink
  ctx.font = '600 20px Georgia, serif'
  ctx.textAlign = 'right'
  const s = fit(ctx, cfg.backFooter, 420, 20, (sz) => `600 ${sz}px Georgia, serif`)
  ctx.font = `600 ${s}px Georgia, serif`
  ctx.fillText(cfg.backFooter, ID_W - 48, ID_H - 52)
  ctx.textAlign = 'left'
}
