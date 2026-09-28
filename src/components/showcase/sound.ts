// All sound effects are synthesized with the Web Audio API — no audio files
// to ship or fetch. One shared AudioContext, created lazily on first use
// (browsers block audio until a user gesture, and a switch/click is exactly
// that gesture).

let ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A single clean, short click — like a mouse button or a camera shutter. */
function click(freq: number, duration = 0.045, gain = 0.16, delay = 0) {
  const c = getCtx()
  if (!c) return
  const start = c.currentTime + delay
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, start)
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp)
  amp.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.01)
}

/** Card switch — one crisp click, pitched slightly differently per direction. */
export function playSwitch(direction: 1 | -1) {
  click(direction === 1 ? 780 : 620, 0.045, 0.16)
}

export function playOpen() {
  click(900, 0.04, 0.13)
}

export function playClose() {
  click(500, 0.04, 0.11)
}

export function playConfirm() {
  click(700, 0.035, 0.13)
  click(1000, 0.05, 0.12, 0.05)
}
