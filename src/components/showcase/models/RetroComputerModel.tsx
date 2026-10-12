import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'

/* ------------------------------------------------------------------ helpers */

function rrPath<T extends THREE.Shape | THREE.Path>(p: T, cx: number, cy: number, w: number, h: number, r: number): T {
  const x = cx - w / 2
  const y = cy - h / 2
  p.moveTo(x + r, y)
  p.lineTo(x + w - r, y)
  p.quadraticCurveTo(x + w, y, x + w, y + r)
  p.lineTo(x + w, y + h - r)
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  p.lineTo(x + r, y + h)
  p.quadraticCurveTo(x, y + h, x, y + h - r)
  p.lineTo(x, y + r)
  p.quadraticCurveTo(x, y, x + r, y)
  return p
}

/* ------------------------------------------------------------------ the CRT screen: an old terminal, typing */

const SCRIPT = [
  'BOOT v2.04  (c) 1994',
  'checking memory ......... 640K ok',
  'mounting /dev/design ..... ok',
  'mounting /dev/code ....... ok',
  '',
  '$ cat hello.c',
  '#include <stdio.h>',
  '',
  'int main(void) {',
  '  printf("hello, world\\n");',
  '  return 0;',
  '}',
  '',
  '$ gcc hello.c -o hello',
  '$ ./hello',
  'hello, world',
  '',
  '$ vi portfolio.js',
  'const make = (thing) => {',
  '  design(thing);',
  '  build(thing);',
  '  return fix(thing);',
  '};',
  '',
  '$ node portfolio.js',
  'make("good things") ... done',
  '',
  '$ ls projects/',
  'ui-ux/  motion/  graphic/  code/',
  '',
].join('\n') + '\n'
const REPEATED = SCRIPT.repeat(60)

const TW = 640
const TH = 480
const CHARS_PER_SEC = 30
const LINE_H = 27
const ROWS = Math.floor((TH - 92) / LINE_H)

function useTerminal() {
  return useMemo(() => {
    const cv = document.createElement('canvas')
    cv.width = TW
    cv.height = TH
    const ctx = cv.getContext('2d')!
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4

    // pre-rendered scanline overlay + vignette
    const scan = document.createElement('canvas')
    scan.width = TW
    scan.height = TH
    const sc = scan.getContext('2d')!
    sc.fillStyle = 'rgba(0,0,0,0.34)'
    for (let y = 0; y < TH; y += 3) sc.fillRect(0, y, TW, 1)
    const vg = sc.createRadialGradient(TW / 2, TH / 2, TH * 0.28, TW / 2, TH / 2, TW * 0.62)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,0.62)')
    sc.fillStyle = vg
    sc.fillRect(0, 0, TW, TH)

    const draw = (t: number) => {
      ctx.save()
      ctx.clearRect(0, 0, TW, TH)
      ctx.beginPath()
      ctx.roundRect(0, 0, TW, TH, 56)
      ctx.clip()
      ctx.fillStyle = '#010402'
      ctx.fillRect(0, 0, TW, TH)

      // typed text -> the last ROWS lines
      const n = Math.floor(t * CHARS_PER_SEC)
      const typed = REPEATED.slice(0, n)
      let end = typed.length
      const lines: string[] = []
      for (let i = 0; i <= ROWS && end >= 0; i++) {
        const start = typed.lastIndexOf('\n', end - 1) + 1
        lines.unshift(typed.slice(start, end))
        end = start - 1
        if (start === 0) break
      }
      // smooth upward scroll each time a new line starts
      const lastLineLen = lines[lines.length - 1].length
      const lineFrac = Math.min(1, lastLineLen / 6)
      const full = lines.length > ROWS
      const shift = full ? (1 - lineFrac * (2 - lineFrac)) * LINE_H : 0
      const visible = full ? lines.slice(lines.length - ROWS - 1) : lines

      ctx.font = `600 22px "Courier New", Courier, monospace`
      ctx.textBaseline = 'top'
      ctx.shadowColor = 'rgba(70,255,120,0.85)'
      ctx.shadowBlur = 11
      const top = 46 - (full ? LINE_H : 0) + shift
      visible.forEach((ln, i) => {
        const y = top + i * LINE_H
        ctx.fillStyle = i === visible.length - 1 ? '#8dffa6' : '#4cf06f'
        ctx.fillText(ln, 40, y)
      })
      // blinking block cursor at the end of the last line
      const last = visible[visible.length - 1] ?? ''
      const cursorOn = Math.floor(t * 2.2) % 2 === 0
      if (cursorOn) {
        ctx.fillStyle = '#8dffa6'
        ctx.fillRect(40 + ctx.measureText(last).width + 2, top + (visible.length - 1) * LINE_H + 2, 13, 22)
      }
      ctx.shadowBlur = 0

      // phosphor glow (soft, strongest in the middle) + a faint flicker
      const glow = ctx.createRadialGradient(TW / 2, TH / 2, 10, TW / 2, TH / 2, TW * 0.6)
      glow.addColorStop(0, 'rgba(70,255,130,0.10)')
      glow.addColorStop(1, 'rgba(70,255,130,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, TW, TH)
      ctx.drawImage(scan, 0, 0)
      ctx.fillStyle = `rgba(120,255,160,${0.012 + 0.012 * Math.sin(t * 47)})`
      ctx.fillRect(0, 0, TW, TH)
      // glass reflection, top-left
      const refl = ctx.createLinearGradient(0, 0, TW * 0.7, TH * 0.7)
      refl.addColorStop(0, 'rgba(255,255,255,0.10)')
      refl.addColorStop(0.35, 'rgba(255,255,255,0)')
      ctx.fillStyle = refl
      ctx.fillRect(0, 0, TW, TH)
      ctx.restore()
      tex.needsUpdate = true
    }
    draw(0)
    return { tex, draw }
  }, [])
}

/* ------------------------------------------------------------------ the keyboard layout (units of one key) */

interface KeyDef {
  x: number
  z: number
  w: number
  mod: boolean
}
const GAP = 0.5
const KEYS: KeyDef[] = (() => {
  const out: KeyDef[] = []
  const row = (r: number, items: Array<[number, boolean]>, x0 = 0) => {
    let x = x0
    for (const [w, mod] of items) {
      if (w > 0) out.push({ x, z: r, w, mod })
      x += Math.abs(w)
    }
  }
  const k = (n: number, mod = false): Array<[number, boolean]> => Array.from({ length: n }, () => [1, mod] as [number, boolean])
  // function row (negative width = a gap)
  row(0, [[1, true], [-0.5, false], ...k(4, true), [-0.25, false], ...k(4, true), [-0.25, false], ...k(4, true)])
  row(1, [...k(13), [2, true]])
  row(2, [[1.5, true], ...k(12), [1.5, true]])
  row(3, [[1.75, true], ...k(11), [2.25, true]])
  row(4, [[2.25, true], ...k(10), [2.75, true]])
  row(5, [[1.5, true], [1.5, true], [9, false], [1.5, true], [1.5, true]])
  // numpad
  for (let r = 1; r <= 5; r++) row(r, k(4, r === 1), 15 + GAP)
  return out
})()
const KB_UNITS = 15 + GAP + 4

/* ------------------------------------------------------------------ the model */

/**
 * A 1990s beige desktop set-up: a bulky CRT (thick bezel, recessed curved-glass screen, a deep
 * rounded-box back with vents on top, power button + two knobs underneath, swivel stand) on a
 * matching desktop case, with a chunky-keycap keyboard on a coiled cable. The screen is an animated
 * green terminal drawn into a canvas texture every frame (scanlines + phosphor glow). No logos.
 */
export function RetroComputerModel({ size }: { item: ModelShowcaseItem; size: number }) {
  const Wm = size * 0.86 // monitor width
  const Hm = Wm * 0.88
  const Dm = Wm * 0.88
  const Bf = Wm * 0.1 // bezel depth
  const Wc = Wm * 1.2 // case
  const Hc = Wc * 0.17
  const Dc = Wm * 0.98
  const standH = Wm * 0.045
  const yMon = Hc + standH // monitor bottom

  const abs = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9cfae', roughness: 0.78, metalness: 0.02 }), [])
  const absDark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#bdb38f', roughness: 0.8, metalness: 0.02 }), [])
  const plate = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cbc19d', roughness: 0.8 }), [])
  const black = useMemo(() => new THREE.MeshStandardMaterial({ color: '#17160f', roughness: 0.7 }), [])
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8f8a76', roughness: 0.6 }), [])
  const ledMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#6dff8c', toneMapped: false }), [])

  // --- CRT
  const ow = Wm * 0.76
  const oh = Hm * 0.66
  const openingY = Hm * 0.585
  const bezelGeo = useMemo(() => {
    const shape = rrPath(new THREE.Shape(), 0, Hm / 2, Wm, Hm, Wm * 0.07)
    shape.holes.push(rrPath(new THREE.Path(), 0, openingY, ow, oh, Wm * 0.07))
    return new THREE.ExtrudeGeometry(shape, { depth: Bf, bevelEnabled: true, bevelSize: Wm * 0.008, bevelThickness: Wm * 0.008, bevelSegments: 3, curveSegments: 14 })
  }, [Wm, Hm, ow, oh, openingY, Bf])
  const back1 = useMemo(() => new RoundedBoxGeometry(Wm * 0.92, Hm * 0.9, Wm * 0.36, 4, Wm * 0.08), [Wm, Hm])
  const back2 = useMemo(() => new RoundedBoxGeometry(Wm * 0.66, Hm * 0.66, Wm * 0.42, 4, Wm * 0.09), [Wm, Hm])
  const backing = useMemo(() => new RoundedBoxGeometry(ow * 1.08, oh * 1.08, Wm * 0.02, 3, Wm * 0.05), [ow, oh, Wm])

  // curved (convex) glass: the middle bulges out, the edges stay put
  const sh = oh * 1.03
  const sw = sh * (TW / TH)
  const bulge = Wm * 0.03
  const glassGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(sw, sh, 26, 20)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const nx = pos.getX(i) / (sw / 2)
      const ny = pos.getY(i) / (sh / 2)
      pos.setZ(i, bulge * Math.max(0, 1 - (nx * nx + ny * ny) / 2))
    }
    g.computeVertexNormals()
    return g
  }, [sw, sh, bulge])

  const { tex, draw } = useTerminal()
  const lastDraw = useRef(0)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (t - lastDraw.current < 1 / 30) return // ~30 fps is plenty for a terminal
    lastDraw.current = t
    draw(t)
  })

  // vents on top of the back
  const ventRef = useRef<THREE.InstancedMesh>(null)
  const VENTS = 13
  useLayoutEffect(() => {
    const mesh = ventRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    for (let i = 0; i < VENTS; i++) {
      m.makeTranslation(0, 0, -i * Wm * 0.021)
      mesh.setMatrixAt(i, m)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [Wm])

  // --- case
  const caseGeo = useMemo(() => new RoundedBoxGeometry(Wc, Hc, Dc, 4, Hc * 0.2), [Wc, Hc, Dc])
  const zCaseFront = Dc / 2

  // --- keyboard
  const Kw = Wm * 0.98
  const unit = Kw / KB_UNITS
  const Kd = unit * 6.2
  const Kt = unit * 0.7
  const keysRef = useRef<THREE.InstancedMesh>(null)
  const keyGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.22), [])
  const keyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 }), [])
  const keyH = unit * 0.62
  useLayoutEffect(() => {
    const mesh = keysRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const col = new THREE.Color()
    const gap = unit * 0.1
    KEYS.forEach((k, i) => {
      const x = -Kw / 2 + unit * (k.x + k.w / 2) + unit * 0.2
      const z = -Kd / 2 + unit * 0.55 + unit * k.z * 1.0 + unit * 0.5
      m.compose(new THREE.Vector3(x, Kt / 2 + keyH / 2, z), q, new THREE.Vector3(unit * k.w - gap, keyH, unit - gap))
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, col.set(k.mod ? '#b9b095' : '#dad1b3'))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [Kw, Kd, Kt, keyH, unit])
  const kbGeo = useMemo(() => new RoundedBoxGeometry(Kw, Kt, Kd, 3, Kt * 0.35), [Kw, Kt, Kd])
  const zKb = Dc / 2 + Kd / 2 + Wm * 0.1

  // --- coiled cable from the keyboard's back edge to the case front
  const coilGeo = useMemo(() => {
    const a = new THREE.Vector3(-Kw * 0.12, Kt * 0.5, zKb - Kd / 2)
    const b = new THREE.Vector3(-Kw * 0.12, Hc * 0.28, zCaseFront)
    const dir = b.clone().sub(a)
    const len = dir.length()
    dir.normalize()
    const u = new THREE.Vector3(1, 0, 0)
    const v = new THREE.Vector3().crossVectors(dir, u).normalize()
    u.crossVectors(v, dir).normalize()
    const turns = 15
    const r = Wm * 0.014
    const pts: THREE.Vector3[] = []
    const N = 360
    for (let i = 0; i <= N; i++) {
      const s = i / N
      const base = a.clone().lerp(b, s)
      base.y -= Math.sin(Math.PI * s) * Wm * 0.012 // a little sag
      const ang = turns * 2 * Math.PI * s
      pts.push(base.add(u.clone().multiplyScalar(Math.cos(ang) * r)).add(v.clone().multiplyScalar(Math.sin(ang) * r)))
    }
    void len
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, Wm * 0.0042, 6, false)
  }, [Kw, Kt, zKb, Kd, Hc, zCaseFront, Wm])
  const coilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cfc5a3', roughness: 0.6 }), [])

  const screenZ = Dm / 2 - Bf * 0.55

  return (
    // turned a little towards the viewer so the screen and the keyboard both read
    <group position={[0, -size * 0.3, -size * 0.05]} rotation={[0.3, 0, 0]}>
      {/* ---- desktop case */}
      <mesh geometry={caseGeo} material={abs} position={[0, Hc / 2, 0]} />
      {/* floppy drive */}
      <mesh material={plate} position={[-Wc * 0.27, Hc * 0.52, zCaseFront + 0.0008]}>
        <boxGeometry args={[Wc * 0.26, Hc * 0.34, 0.003]} />
      </mesh>
      <mesh material={black} position={[-Wc * 0.27, Hc * 0.58, zCaseFront + 0.003]}>
        <boxGeometry args={[Wc * 0.18, Hc * 0.04, 0.003]} />
      </mesh>
      <mesh material={absDark} position={[-Wc * 0.18, Hc * 0.4, zCaseFront + 0.003]}>
        <boxGeometry args={[Wc * 0.05, Hc * 0.05, 0.004]} />
      </mesh>
      {/* CD-ROM */}
      <mesh material={plate} position={[Wc * 0.12, Hc * 0.52, zCaseFront + 0.0008]}>
        <boxGeometry args={[Wc * 0.4, Hc * 0.34, 0.003]} />
      </mesh>
      <mesh material={black} position={[Wc * 0.12, Hc * 0.6, zCaseFront + 0.003]}>
        <boxGeometry args={[Wc * 0.34, Hc * 0.025, 0.003]} />
      </mesh>
      <mesh material={absDark} position={[Wc * 0.26, Hc * 0.4, zCaseFront + 0.003]}>
        <boxGeometry args={[Wc * 0.05, Hc * 0.05, 0.004]} />
      </mesh>
      {/* power button + LEDs */}
      <mesh material={absDark} position={[Wc * 0.4, Hc * 0.5, zCaseFront + 0.004]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[Hc * 0.13, Hc * 0.13, 0.012, 24]} />
      </mesh>
      <mesh material={ledMat} position={[Wc * 0.4, Hc * 0.26, zCaseFront + 0.003]}>
        <circleGeometry args={[Hc * 0.028, 12]} />
      </mesh>
      {/* feet */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} material={black} position={[sx * Wc * 0.44, -0.004, sz * Dc * 0.4]}>
            <boxGeometry args={[Wc * 0.07, 0.01, Dc * 0.07]} />
          </mesh>
        )),
      )}

      {/* ---- CRT monitor on a small swivel stand */}
      <mesh material={abs} position={[0, Hc + standH * 0.25, -Wm * 0.02]}>
        <cylinderGeometry args={[Wm * 0.2, Wm * 0.23, standH * 0.5, 36]} />
      </mesh>
      <mesh material={absDark} position={[0, Hc + standH * 0.72, -Wm * 0.02]}>
        <cylinderGeometry args={[Wm * 0.12, Wm * 0.15, standH * 0.56, 32]} />
      </mesh>
      <group position={[0, yMon, -Wm * 0.02]}>
        {/* thick front bezel with the screen opening */}
        <mesh geometry={bezelGeo} material={abs} position={[0, 0, Dm / 2 - Bf]} />
        {/* deep, tapering back */}
        <mesh geometry={back1} material={abs} position={[0, Hm * 0.5, Dm / 2 - Bf - Wm * 0.17]} />
        <mesh geometry={back2} material={abs} position={[0, Hm * 0.5, Dm / 2 - Bf - Wm * 0.36 - Wm * 0.18]} />
        {/* ventilation slots on top */}
        <instancedMesh ref={ventRef} args={[undefined, undefined, VENTS]} position={[0, Hm * 0.95 + 0.0008, Dm / 2 - Bf - Wm * 0.05]}>
          <boxGeometry args={[Wm * 0.5, 0.003, Wm * 0.01]} />
          <meshStandardMaterial color="#8a8369" roughness={0.9} />
        </instancedMesh>
        {/* tube backing + curved glass, recessed behind the bezel */}
        <mesh geometry={backing} material={black} position={[0, openingY, screenZ - Wm * 0.025]} />
        <mesh geometry={glassGeo} position={[0, openingY, screenZ]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {/* power button, LED and two knobs under the screen */}
        <mesh material={absDark} position={[-Wm * 0.34, Hm * 0.115, Dm / 2 + Wm * 0.004]}>
          <boxGeometry args={[Wm * 0.07, Hm * 0.045, Wm * 0.012]} />
        </mesh>
        <mesh material={ledMat} position={[-Wm * 0.22, Hm * 0.115, Dm / 2 + Wm * 0.002]}>
          <circleGeometry args={[Wm * 0.008, 12]} />
        </mesh>
        {[0.2, 0.31].map((x) => (
          <group key={x} position={[Wm * x, Hm * 0.115, Dm / 2 + Wm * 0.002]}>
            <mesh material={grey} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[Wm * 0.03, Wm * 0.033, Wm * 0.026, 28]} />
            </mesh>
            <mesh material={black} position={[0, Wm * 0.012, Wm * 0.014]}>
              <boxGeometry args={[Wm * 0.006, Wm * 0.022, Wm * 0.004]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- keyboard on the desk, a little wedge, with chunky keycaps */}
      <group position={[0, 0, zKb]}>
        <group position={[0, Kt * 0.5, 0]} rotation={[0.1, 0, 0]}>
          <mesh geometry={kbGeo} material={abs} />
          <instancedMesh ref={keysRef} args={[undefined, undefined, KEYS.length]} geometry={keyGeo} material={keyMat} />
        </group>
      </group>
      {/* coiled cable */}
      <mesh geometry={coilGeo} material={coilMat} />
    </group>
  )
}
