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
  amp.gain.linearRampToValueAtTime(gain, start + Math.min(0.008, duration * 0.2))
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp)
  amp.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** A short burst of filtered noise — the "thock" transient under a pitched blip. */
function thock(duration: number, opts: { gain?: number; delay?: number; freq?: number } = {}) {
  const c = getCtx()
  if (!c) return
  const { gain = 0.22, delay = 0, freq = 1400 } = opts
  const start = c.currentTime + delay
  const len = Math.max(1, Math.floor(c.sampleRate * duration))
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) // decaying noise
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = 0.9
  const amp = c.createGain()
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  src.connect(filter)
  filter.connect(amp)
  amp.connect(c.destination)
  src.start(start)
  src.stop(start + duration + 0.01)
}

/** Card switch — a crunchy, PSP-menu-ish "thock": noise transient + a short pitched click. */
export function playSwitch(direction: 1 | -1) {
  thock(0.05, { gain: 0.26, freq: direction === 1 ? 1700 : 1200 })
  if (direction === 1) tone(360, 620, 0.07, { type: 'square', gain: 0.09 })
  else tone(520, 300, 0.07, { type: 'square', gain: 0.09 })
}

export function playOpen() {
  thock(0.035, { gain: 0.18, freq: 2000 })
  tone(600, 950, 0.06, { type: 'square', gain: 0.08 })
}

export function playClose() {
  thock(0.035, { gain: 0.16, freq: 900 })
  tone(500, 300, 0.06, { type: 'square', gain: 0.07 })
}

export function playConfirm() {
  thock(0.04, { gain: 0.2, freq: 1800 })
  tone(560, 820, 0.07, { type: 'square', gain: 0.1 })
  tone(820, 1080, 0.1, { type: 'square', gain: 0.09, delay: 0.06 })
}
