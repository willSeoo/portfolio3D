import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { roundedFaceGeometry, roundedSlabGeometry } from './geometry'

/* ------------------------------------------------------------------ the screen: a clean motion-design mockup */

function drawScreen(): HTMLCanvasElement {
  const W = 1920
  const H = 1248
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')!
  const sans = 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    c.beginPath()
    c.moveTo(x + r, y)
    c.arcTo(x + w, y, x + w, y + h, r)
    c.arcTo(x + w, y + h, x, y + h, r)
    c.arcTo(x, y + h, x, y, r)
    c.arcTo(x, y, x + w, y, r)
    c.closePath()
  }

  // wallpaper: deep blue → violet with soft light blobs
  const g = c.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#16224f')
  g.addColorStop(0.5, '#3b3a9e')
  g.addColorStop(1, '#8a4fc7')
  c.fillStyle = g
  c.fillRect(0, 0, W, H)
  ;[[420, 980, 520, 'rgba(94,170,255,0.38)'], [1560, 260, 460, 'rgba(255,128,170,0.30)'], [1100, 1100, 420, 'rgba(120,255,214,0.18)']].forEach(([x, y, r, col]) => {
    const rg = c.createRadialGradient(x as number, y as number, 0, x as number, y as number, r as number)
    rg.addColorStop(0, col as string)
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = rg
    c.fillRect(0, 0, W, H)
  })

  // menu bar (generic items, no logos)
  c.fillStyle = 'rgba(255,255,255,0.16)'
  c.fillRect(0, 0, W, 46)
  c.fillStyle = '#ffffff'
  c.font = `700 22px ${sans}`
  c.fillText('Motion', 40, 31)
  c.font = `500 22px ${sans}`
  ;['File', 'Edit', 'Clip', 'View', 'Window'].forEach((t, i) => c.fillText(t, 150 + i * 92, 31))
  c.textAlign = 'right'
  c.fillText('Thu 9:41', W - 34, 31)
  c.textAlign = 'left'
  ;[0, 1, 2].forEach((i) => {
    c.fillStyle = 'rgba(255,255,255,0.85)'
    rr(W - 250 + i * 40, 14, 24, 18, 5)
    c.fill()
  })

  // app window
  const wx = 150
  const wy = 96
  const ww = W - 300
  const wh = 960
  c.save()
  c.shadowColor = 'rgba(8,10,40,0.5)'
  c.shadowBlur = 60
  c.shadowOffsetY = 24
  c.fillStyle = '#f7f8fa'
  rr(wx, wy, ww, wh, 26)
  c.fill()
  c.restore()
  c.save()
  rr(wx, wy, ww, wh, 26)
  c.clip()

  // title bar
  c.fillStyle = '#eceef2'
  c.fillRect(wx, wy, ww, 62)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    c.fillStyle = col
    c.beginPath()
    c.arc(wx + 38 + i * 32, wy + 31, 9, 0, Math.PI * 2)
    c.fill()
  })
  c.fillStyle = '#2a2d34'
  c.font = `600 22px ${sans}`
  c.textAlign = 'center'
  c.fillText('Loop Studies — Timeline', wx + ww / 2, wy + 39)
  c.textAlign = 'left'

  // left: media bin
  c.fillStyle = '#f1f2f5'
  c.fillRect(wx, wy + 62, 270, 640)
  c.fillStyle = '#8a8f99'
  c.font = `600 18px ${sans}`
  c.fillText('MEDIA', wx + 26, wy + 106)
  const thumbs: Array<[string, string]> = [['#ff8a5c', '#ffcf6b'], ['#3fb4a8', '#7fe0c2'], ['#7a6bff', '#c18cff'], ['#ff5c8a', '#ffb0c4']]
  thumbs.forEach(([a, b], i) => {
    const tx = wx + 26 + (i % 2) * 118
    const ty = wy + 130 + Math.floor(i / 2) * 104
    const tg = c.createLinearGradient(tx, ty, tx + 100, ty + 84)
    tg.addColorStop(0, a)
    tg.addColorStop(1, b)
    c.fillStyle = tg
    rr(tx, ty, 100, 84, 12)
    c.fill()
  })
  c.fillStyle = '#c7cad2'
  ;[0, 1, 2, 3].forEach((i) => {
    rr(wx + 26, wy + 360 + i * 40, 200 - i * 24, 12, 6)
    c.fill()
  })

  // centre: preview
  const px = wx + 300
  const py = wy + 92
  const pw = 760
  const ph = 440
  c.fillStyle = '#14161c'
  rr(px, py, pw, ph, 18)
  c.fill()
  c.save()
  rr(px, py, pw, ph, 18)
  c.clip()
  const bg = c.createLinearGradient(px, py, px + pw, py + ph)
  bg.addColorStop(0, '#1d2250')
  bg.addColorStop(1, '#3a2a78')
  c.fillStyle = bg
  c.fillRect(px, py, pw, ph)
  const orb = c.createRadialGradient(px + 470, py + 180, 10, px + 470, py + 180, 190)
  orb.addColorStop(0, '#ffd27a')
  orb.addColorStop(0.55, '#ff7a6b')
  orb.addColorStop(1, 'rgba(255,90,140,0)')
  c.fillStyle = orb
  c.beginPath()
  c.arc(px + 470, py + 180, 190, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = 'rgba(111,226,200,0.9)'
  rr(px + 120, py + 250, 250, 120, 40)
  c.fill()
  c.restore()
  // motion path with keyframes
  c.strokeStyle = '#ffffff'
  c.lineWidth = 4
  c.setLineDash([10, 10])
  c.beginPath()
  c.moveTo(px + 130, py + 330)
  c.bezierCurveTo(px + 260, py + 120, px + 420, py + 380, px + 620, py + 150)
  c.stroke()
  c.setLineDash([])
  ;[[130, 330], [330, 250], [470, 270], [620, 150]].forEach(([x, y]) => {
    c.save()
    c.translate(px + x, py + y)
    c.rotate(Math.PI / 4)
    c.fillStyle = '#ffffff'
    c.strokeStyle = '#3b82f6'
    c.lineWidth = 3
    c.fillRect(-9, -9, 18, 18)
    c.strokeRect(-9, -9, 18, 18)
    c.restore()
  })

  // right: inspector
  const ix = wx + 1090
  c.fillStyle = '#f1f2f5'
  c.fillRect(ix, wy + 62, ww - 1090, 640)
  c.fillStyle = '#8a8f99'
  c.font = `600 18px ${sans}`
  c.fillText('INSPECTOR', ix + 26, wy + 106)
  ;[['Position', 0.62], ['Scale', 0.4], ['Rotation', 0.22], ['Opacity', 0.86], ['Ease', 0.55]].forEach(([label, v], i) => {
    const y = wy + 150 + i * 92
    c.fillStyle = '#4a4e57'
    c.font = `500 20px ${sans}`
    c.fillText(label as string, ix + 26, y)
    c.fillStyle = '#dcdfe5'
    rr(ix + 26, y + 18, ww - 1090 - 52, 10, 5)
    c.fill()
    c.fillStyle = '#3b82f6'
    rr(ix + 26, y + 18, (ww - 1090 - 52) * (v as number), 10, 5)
    c.fill()
    c.fillStyle = '#fff'
    c.strokeStyle = '#3b82f6'
    c.lineWidth = 3
    c.beginPath()
    c.arc(ix + 26 + (ww - 1090 - 52) * (v as number), y + 23, 11, 0, Math.PI * 2)
    c.fill()
    c.stroke()
  })

  // bottom: timeline
  const ty0 = wy + 704
  c.fillStyle = '#ffffff'
  c.fillRect(wx, ty0, ww, wh - 704)
  c.fillStyle = '#e4e6eb'
  c.fillRect(wx, ty0, ww, 2)
  c.fillStyle = '#8a8f99'
  c.font = `500 16px ${sans}`
  const tlx = wx + 190
  const tlw = ww - 230
  for (let i = 0; i <= 20; i++) {
    const x = tlx + (tlw / 20) * i
    c.fillRect(x, ty0 + 20, 2, i % 5 === 0 ? 18 : 9)
    if (i % 5 === 0) c.fillText(`00:${String(i / 2).padStart(2, '0')}`, x + 6, ty0 + 52)
  }
  const layerCols = ['#ff7a6b', '#3fb4a8', '#7a6bff', '#f2b84b']
  const layerNames = ['Orb', 'Capsule', 'Path', 'Glow']
  layerCols.forEach((col, i) => {
    const y = ty0 + 70 + i * 46
    c.fillStyle = '#4a4e57'
    c.font = `500 18px ${sans}`
    c.fillText(layerNames[i], wx + 30, y + 24)
    c.fillStyle = col
    const start = [0.04, 0.16, 0.3, 0.1][i]
    const len = [0.62, 0.5, 0.58, 0.8][i]
    rr(tlx + tlw * start, y + 4, tlw * len, 30, 9)
    c.fill()
    c.fillStyle = '#ffffff'
    ;[0.1, 0.4, 0.75].forEach((k) => {
      c.save()
      c.translate(tlx + tlw * (start + len * k), y + 19)
      c.rotate(Math.PI / 4)
      c.fillRect(-6, -6, 12, 12)
      c.restore()
    })
  })
  // playhead
  c.fillStyle = '#ff3b4a'
  c.fillRect(tlx + tlw * 0.38, ty0 + 8, 3, wh - 704 - 8)
  c.beginPath()
  c.moveTo(tlx + tlw * 0.38 - 12, ty0 + 8)
  c.lineTo(tlx + tlw * 0.38 + 15, ty0 + 8)
  c.lineTo(tlx + tlw * 0.38 + 1.5, ty0 + 30)
  c.closePath()
  c.fill()
  c.restore()

  // dock
  c.fillStyle = 'rgba(255,255,255,0.22)'
  rr(W / 2 - 360, H - 120, 720, 92, 30)
  c.fill()
  const dock = ['#ff7a6b', '#3fb4a8', '#7a6bff', '#f2b84b', '#4aa3ff', '#ff5c8a', '#8ee07a', '#c7cad2']
  dock.forEach((col, i) => {
    const x = W / 2 - 330 + i * 84
    const dg = c.createLinearGradient(x, H - 108, x + 64, H - 44)
    dg.addColorStop(0, col)
    dg.addColorStop(1, 'rgba(255,255,255,0.55)')
    c.fillStyle = dg
    rr(x, H - 108, 66, 66, 17)
    c.fill()
  })

  // camera notch (black, hanging from the top edge) + the lens
  c.fillStyle = '#000'
  c.beginPath()
  c.moveTo(W / 2 - 150, 0)
  c.lineTo(W / 2 + 150, 0)
  c.lineTo(W / 2 + 150, 18)
  c.arcTo(W / 2 + 150, 52, W / 2 + 118, 52, 32)
  c.lineTo(W / 2 - 118, 52)
  c.arcTo(W / 2 - 150, 52, W / 2 - 150, 18, 32)
  c.closePath()
  c.fill()
  c.fillStyle = '#12151c'
  c.beginPath()
  c.arc(W / 2, 22, 10, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = 'rgba(80,110,200,0.55)'
  c.beginPath()
  c.arc(W / 2 - 2, 20, 3.5, 0, Math.PI * 2)
  c.fill()

  return cv
}

/** Thin dark slits for the speaker grille strip (alpha-tested, so no blending). */
function drawGrille(): HTMLCanvasElement {
  const cv = document.createElement('canvas')
  cv.width = 1536
  cv.height = 32
  const c = cv.getContext('2d')!
  c.fillStyle = '#000'
  for (let i = 0; i < 120; i++) {
    const x = 6 + i * 12.6
    c.beginPath()
    c.roundRect(x, 6, 7, 20, 3.5)
    c.fill()
  }
  return cv
}

/* ------------------------------------------------------------------ the model */

const KEY_ROWS: Array<{ h: number; keys: number[] }> = [
  { h: 0.65, keys: [1.5, ...Array(12).fill(1), 1] },
  { h: 1, keys: [...Array(13).fill(1), 1.5] },
  { h: 1, keys: [1.5, ...Array(12).fill(1), 1] },
  { h: 1, keys: [1.75, ...Array(11).fill(1), 1.75] },
  { h: 1, keys: [2.25, ...Array(10).fill(1), 2.25] },
  { h: 1, keys: [1, 1, 1, 1.25, 5, 1.25, 1, 1, 1, 1] },
]

/**
 * A MacBook Air 13" (M3) in Midnight: one uniform ~11 mm slab (matte, dark navy-black anodised
 * aluminium), the lid opened ~107°, edge-to-edge black glass with very thin bezels and a camera notch,
 * a speaker-grille strip above a full black keyboard, and a large glass trackpad. No logo anywhere.
 * (Proportions follow the real machine: 304 × 215 mm, lid ≈ 4 mm, base ≈ 7 mm.)
 */
export function LaptopModel({ size }: { item: ModelShowcaseItem; size: number }) {
  const W = size * 1.5
  const D = W * 0.707
  const Tb = W * 0.0245 // base thickness
  const Tl = W * 0.0145 // lid thickness
  const theta = (107 * Math.PI) / 180 // lid opening
  const m = W * 0.012 // aluminium rim around the glass
  const rCorner = W * 0.02

  const baseGeo = useMemo(() => roundedSlabGeometry(W, D, Tb, rCorner, Tb * 0.28), [W, D, Tb, rCorner])
  const lidGeo = useMemo(() => roundedSlabGeometry(W, D, Tl, rCorner, Tl * 0.28), [W, D, Tl, rCorner])
  const alu = useMemo(() => new THREE.MeshStandardMaterial({ color: '#343d4b', roughness: 0.62, metalness: 0.62 }), [])
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#030305', roughness: 0.16, metalness: 0.25 }), [])
  const glassGeo = useMemo(() => roundedFaceGeometry(W - 2 * m, D - 2 * m, rCorner * 0.7), [W, D, m, rCorner])

  // display content area inside the glass: very thin side/top borders, a slightly deeper chin
  const sideB = W * 0.016
  const topB = W * 0.024
  const chin = W * 0.046
  const zb = m + chin
  const zt = D - m - topB
  const sw = W - 2 * m - 2 * sideB
  const sh = zt - zb
  const screenTex = useMemo(() => {
    const t = new THREE.CanvasTexture(drawScreen())
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])
  const grilleTex = useMemo(() => new THREE.CanvasTexture(drawGrille()), [])

  // keys
  const keysRef = useRef<THREE.InstancedMesh>(null)
  const kbW = W * 0.86
  const p = kbW / 14.5
  const gap = p * 0.11
  const kt = W * 0.0085
  const keyGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.16), [])
  const keyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f1013', roughness: 0.5, metalness: 0.15 }), [])
  const zBack = -D / 2 + D * 0.115
  const keyCount = KEY_ROWS.reduce((n, r) => n + r.keys.length, 0)
  useLayoutEffect(() => {
    const mesh = keysRef.current
    if (!mesh) return
    const mat = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    let i = 0
    let z = zBack
    for (const row of KEY_ROWS) {
      const zc = z + (row.h * p) / 2
      let x = -kbW / 2
      for (const w of row.keys) {
        const xc = x + (w * p) / 2
        mat.compose(new THREE.Vector3(xc, Tb + kt / 2, zc), q, new THREE.Vector3(w * p - gap, kt, row.h * p - gap))
        mesh.setMatrixAt(i++, mat)
        x += w * p
      }
      z += row.h * p
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [kbW, p, gap, kt, Tb, zBack])

  // trackpad
  const tpW = W * 0.385
  const tpD = D * 0.34
  const tpZ = D / 2 - D * 0.03 - tpD / 2
  const tpGeo = useMemo(() => roundedFaceGeometry(tpW, tpD, W * 0.008), [tpW, tpD, W])
  const tpRimGeo = useMemo(() => roundedFaceGeometry(tpW + W * 0.006, tpD + W * 0.006, W * 0.0095), [tpW, tpD, W])
  const tpMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2c3441', roughness: 0.14, metalness: 0.22 }), [])
  const tpRimMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1f27', roughness: 0.6, metalness: 0.3 }), [])
  const hingeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#14171d', roughness: 0.5, metalness: 0.6 }), [])

  return (
    // turned a little towards the viewer so the screen *and* the keyboard both read
    <group position={[0, -size * 0.36, 0]} rotation={[0.5, 0, 0]}>
      {/* base */}
      <mesh geometry={baseGeo} material={alu} rotation={[-Math.PI / 2, 0, 0]} position={[0, Tb / 2, 0]} />
      {/* speaker grille strip above the keys */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Tb + 0.0005, -D / 2 + D * 0.052]}>
        <planeGeometry args={[W * 0.78, D * 0.026]} />
        <meshBasicMaterial map={grilleTex} alphaTest={0.5} transparent={false} color="#06070a" side={THREE.DoubleSide} />
      </mesh>
      {/* keys */}
      <instancedMesh ref={keysRef} args={[undefined, undefined, keyCount]} material={keyMat} geometry={keyGeo} />
      {/* trackpad */}
      <mesh geometry={tpRimGeo} material={tpRimMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, Tb + 0.0004, tpZ]} />
      <mesh geometry={tpGeo} material={tpMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, Tb + 0.0008, tpZ]} />
      {/* hinge */}
      <mesh material={hingeMat} rotation={[0, 0, Math.PI / 2]} position={[0, Tb * 0.92, -D / 2 + Tl * 0.2]}>
        <cylinderGeometry args={[Tl * 0.55, Tl * 0.55, W * 0.82, 20]} />
      </mesh>

      {/* lid, opened ~107° about the back edge */}
      <group position={[0, Tb * 0.92, -D / 2 + Tl * 0.2]} rotation={[-theta, 0, 0]}>
        <mesh geometry={lidGeo} material={alu} rotation={[-Math.PI / 2, 0, 0]} position={[0, Tl / 2 + 0.0004, D / 2]} />
        {/* black glass, edge to edge, on the inner face */}
        <mesh geometry={glassGeo} material={glassMat} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.0003, D / 2]} />
        {/* the display */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.0008, (zb + zt) / 2]}>
          <planeGeometry args={[sw, sh]} />
          <meshBasicMaterial map={screenTex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
