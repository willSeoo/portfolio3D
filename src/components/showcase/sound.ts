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

function tone(freqFrom: number, freqTo: number, duration: number, opts: { type?: OscillatorType; gain?: number; delay?: number } = {}) {
  const c = getCtx()
  if (!c) return
  const { type = 'sine', gain = 0.14, delay = 0 } = opts
  const start = c.currentTime + delay
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freqFrom, start)
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), start + duration)
  amp.gain.setValueAtTime(0, start)
  amp.gain.linearRampToValueAtTime(gain, start + Math.min(0.012, duration * 0.3))
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp)
  amp.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** Card switch — a quick pitch sweep, direction sets whether it rises or falls. */
export function playSwitch(direction: 1 | -1) {
  if (direction === 1) tone(320, 720, 0.14, { type: 'triangle', gain: 0.12 })
  else tone(560, 260, 0.14, { type: 'triangle', gain: 0.12 })
}

export function playOpen() {
  tone(500, 900, 0.1, { type: 'sine', gain: 0.1 })
}

export function playClose() {
  tone(500, 320, 0.09, { type: 'sine', gain: 0.09 })
}

export function playConfirm() {
  tone(520, 780, 0.09, { type: 'sine', gain: 0.13 })
  tone(780, 1040, 0.13, { type: 'sine', gain: 0.11, delay: 0.07 })
}
