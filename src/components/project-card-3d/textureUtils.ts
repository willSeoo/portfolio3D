/** Shared canvas helpers for baking a card face into a texture. */

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Stadium / pill outline: fully round ends. */
export function pillPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRectPath(ctx, x, y, w, h, h / 2)
}

/** A gently slanted quad, echoing the "cut" card shape from the 2D version. */
export function cutPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const s = h * 0.08
  ctx.beginPath()
  ctx.moveTo(x, y + s)
  ctx.lineTo(x + w * 0.94, y)
  ctx.lineTo(x + w, y + h * 0.92)
  ctx.lineTo(x + w * 0.06, y + h)
  ctx.closePath()
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/** Greedy word-wrap; returns at most maxLines, the last one ellipsised if text overflows. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length === maxLines - 1) break
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) lines.length = maxLines
  const consumed = lines.join(' ').split(/\s+/).length
  if (consumed < words.length && lines.length === maxLines) {
    let last = lines[maxLines - 1]
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1)
    lines[maxLines - 1] = `${last}…`
  }
  return lines
}

/** Fixed canvas resolution every face is baked at: matches the ID-1 card ratio (1.586). */
export const TEX_W = 1024
export const TEX_H = Math.round(TEX_W / 1.586)
