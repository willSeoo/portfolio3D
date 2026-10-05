export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** easeInOutCubic: ~6% at 25% scroll, 50% at 50%, ~94% at 75% — matches the spec's keyframes. */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** Gentle S-curve: no hard start or stop, so the zoom-out feels like one continuous camera move. */
export const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2
