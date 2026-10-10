import { useMemo } from 'react'
import * as THREE from 'three'
import type { ModelShowcaseItem } from '../types'
import { roundedSlabGeometry } from './geometry'

/* ------------------------------------------------------------------ the screen: a poster mid-design */

function drawScreen(): HTMLCanvasElement {
  const W = 1920
  const H = 1080
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

  // workspace
  c.fillStyle = '#2d2e32'
  c.fillRect(0, 0, W, H)

  // top bar
  c.fillStyle = '#232427'
  c.fillRect(0, 0, W, 54)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    c.fillStyle = col
    c.beginPath()
    c.arc(30 + i * 30, 27, 8, 0, Math.PI * 2)
    c.fill()
  })
  c.fillStyle = '#6d7078'
  ;[0, 1, 2, 3, 4, 5].forEach((i) => {
    rr(160 + i * 96, 22, 66, 10, 5)
    c.fill()
  })
  c.fillStyle = '#9aa0ab'
  c.font = `500 20px ${sans}`
  c.textAlign = 'center'
  c.fillText('poster-series-01.design', W / 2 + 130, 34)
  c.textAlign = 'left'

  // left toolbox
  c.fillStyle = '#26272b'
  c.fillRect(0, 54, 84, H - 54)
  for (let i = 0; i < 9; i++) {
    const y = 84 + i * 76
    if (i === 1) {
      c.fillStyle = '#3b82f6'
      rr(14, y - 8, 56, 56, 12)
      c.fill()
    }
    c.strokeStyle = i === 1 ? '#fff' : '#8a8f99'
    c.lineWidth = 3.5
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    if (i === 0) { c.moveTo(30, y + 2); c.lineTo(30, y + 34); c.lineTo(38, y + 27); c.lineTo(48, y + 38) }
    else if (i === 1) { c.moveTo(28, y + 36); c.lineTo(34, y + 12); c.lineTo(52, y + 4); c.lineTo(46, y + 28); c.closePath() }
    else if (i === 2) { rr(26, y + 6, 32, 28, 4) }
    else if (i === 3) { c.arc(42, y + 20, 15, 0, Math.PI * 2) }
    else if (i === 4) { c.moveTo(26, y + 36); c.lineTo(58, y + 4) }
    else if (i === 5) { c.moveTo(28, y + 8); c.lineTo(56, y + 8); c.moveTo(42, y + 8); c.lineTo(42, y + 36) }
    else if (i === 6) { c.moveTo(26, y + 34); c.bezierCurveTo(30, y + 2, 54, y + 2, 58, y + 34) }
    else if (i === 7) { rr(26, y + 8, 32, 24, 3); c.moveTo(34, y + 20); c.lineTo(50, y + 20) }
    else { c.arc(42, y + 20, 5, 0, Math.PI * 2) }
    c.stroke()
  }

  // right panels
  c.fillStyle = '#26272b'
  c.fillRect(1560, 54, 360, H - 54)
  c.fillStyle = '#c7cbd3'
  c.font = `600 22px ${sans}`
  c.fillText('Layers', 1584, 100)
  const layers: Array<[string, string]> = [['Headline', '#1b1c1f'], ['Logo mark', '#f08a5d'], ['Circle', '#3fa7a0'], ['Body copy', '#8a8f99'], ['Background', '#f4efe6']]
  layers.forEach(([name, col], i) => {
    const y = 120 + i * 62
    if (i === 0) {
      c.fillStyle = '#34363c'
      rr(1572, y - 6, 336, 54, 10)
      c.fill()
    }
    c.fillStyle = col
    rr(1588, y + 4, 34, 34, 7)
    c.fill()
    c.fillStyle = i === 0 ? '#ffffff' : '#9aa0ab'
    c.font = `500 20px ${sans}`
    c.fillText(name, 1640, y + 30)
  })
  c.fillStyle = '#c7cbd3'
  c.font = `600 22px ${sans}`
  c.fillText('Colour', 1584, 470)
  ;['#f4efe6', '#1b1c1f', '#f08a5d', '#3fa7a0', '#f2b84b', '#6e63c9'].forEach((col, i) => {
    c.fillStyle = col
    rr(1584 + (i % 3) * 112, 492 + Math.floor(i / 3) * 82, 96, 66, 12)
    c.fill()
  })
  c.fillStyle = '#c7cbd3'
  c.font = `600 22px ${sans}`
  c.fillText('Type', 1584, 700)
  c.fillStyle = '#34363c'
  rr(1584, 718, 312, 84, 12)
  c.fill()
  c.fillStyle = '#ffffff'
  c.font = `800 52px ${sans}`
  c.fillText('Aa', 1608, 778)
  c.fillStyle = '#9aa0ab'
  c.font = `500 18px ${sans}`
  c.fillText('Display Bold · 118 pt', 1700, 768)
  c.fillStyle = '#3a3c42'
  ;[0, 1].forEach((i) => {
    rr(1584, 836 + i * 44, 312, 8, 4)
    c.fill()
    c.fillStyle = '#3b82f6'
    rr(1584, 836 + i * 44, 150 + i * 70, 8, 4)
    c.fill()
    c.fillStyle = '#3a3c42'
  })

  // canvas area + rulers
  c.fillStyle = '#34353a'
  c.fillRect(84, 54, 1476, 30)
  c.fillRect(84, 54, 30, H - 54)
  c.fillStyle = '#6d7078'
  for (let x = 130; x < 1560; x += 40) c.fillRect(x, 70, 2, (x / 40) % 5 === 0 ? 14 : 7)
  for (let y = 100; y < H; y += 40) c.fillRect(100, y, (y / 40) % 5 === 0 ? 14 : 7, 2)

  // artboard (the poster)
  const ax = 520
  const ay = 118
  const aw = 640
  const ah = 900
  c.save()
  c.shadowColor = 'rgba(0,0,0,0.45)'
  c.shadowBlur = 40
  c.shadowOffsetY = 12
  c.fillStyle = '#f4efe6'
  c.fillRect(ax, ay, aw, ah)
  c.restore()
  c.save()
  c.beginPath()
  c.rect(ax, ay, aw, ah)
  c.clip()
  c.fillStyle = '#3fa7a0'
  c.beginPath()
  c.arc(ax + aw - 120, ay + 250, 210, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#f08a5d'
  c.beginPath()
  c.arc(ax + 80, ay + ah - 40, 270, Math.PI, Math.PI * 2)
  c.fill()
  c.fillStyle = '#f2b84b'
  c.beginPath()
  c.arc(ax + aw - 70, ay + ah - 150, 64, 0, Math.PI * 2)
  c.fill()
  c.restore()

  // logo mark being drawn (pen tool: anchors + handles)
  c.strokeStyle = '#1b1c1f'
  c.lineWidth = 7
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(ax + 56, ay + 108)
  c.bezierCurveTo(ax + 86, ay + 48, ax + 150, ay + 48, ax + 176, ay + 100)
  c.bezierCurveTo(ax + 196, ay + 140, ax + 150, ay + 160, ax + 118, ay + 130)
  c.stroke()
  const anchors: Array<[number, number]> = [[ax + 56, ay + 108], [ax + 176, ay + 100], [ax + 118, ay + 130]]
  c.strokeStyle = '#3b82f6'
  c.lineWidth = 2
  c.beginPath()
  c.moveTo(ax + 56, ay + 108); c.lineTo(ax + 86, ay + 48)
  c.moveTo(ax + 176, ay + 100); c.lineTo(ax + 150, ay + 48)
  c.moveTo(ax + 176, ay + 100); c.lineTo(ax + 196, ay + 140)
  c.stroke()
  anchors.forEach(([x, y]) => {
    c.fillStyle = '#fff'
    c.strokeStyle = '#3b82f6'
    c.lineWidth = 2.5
    c.fillRect(x - 7, y - 7, 14, 14)
    c.strokeRect(x - 7, y - 7, 14, 14)
  })
  ;[[ax + 86, ay + 48], [ax + 150, ay + 48], [ax + 196, ay + 140]].forEach(([x, y]) => {
    c.fillStyle = '#3b82f6'
    c.beginPath()
    c.arc(x, y, 6, 0, Math.PI * 2)
    c.fill()
  })

  // headline
  c.fillStyle = '#1b1c1f'
  c.font = `900 126px ${sans}`
  c.textBaseline = 'alphabetic'
  ;['MAKE', 'GOOD', 'THINGS'].forEach((line, i) => c.fillText(line, ax + 46, ay + 360 + i * 118))
  c.font = `600 24px ${sans}`
  c.fillStyle = '#1b1c1f'
  c.fillText('POSTER SERIES  /  VOL. 01  /  2026', ax + 48, ay + 770)
  c.fillStyle = 'rgba(27,28,31,0.55)'
  ;[0, 1, 2].forEach((i) => {
    rr(ax + 48, ay + 800 + i * 28, 300 - i * 50, 10, 5)
    c.fill()
  })

  // selection box around the headline
  const sx = ax + 30
  const sy = ay + 256
  const sw = 560
  const sh = 340
  c.strokeStyle = '#3b82f6'
  c.lineWidth = 3
  c.strokeRect(sx, sy, sw, sh)
  ;[[sx, sy], [sx + sw / 2, sy], [sx + sw, sy], [sx, sy + sh / 2], [sx + sw, sy + sh / 2], [sx, sy + sh], [sx + sw / 2, sy + sh], [sx + sw, sy + sh]].forEach(([x, y]) => {
    c.fillStyle = '#fff'
    c.fillRect(x - 8, y - 8, 16, 16)
    c.strokeRect(x - 8, y - 8, 16, 16)
  })
  c.fillStyle = '#3b82f6'
  rr(sx + sw / 2 - 62, sy + sh + 18, 124, 32, 8)
  c.fill()
  c.fillStyle = '#fff'
  c.font = `600 18px ${sans}`
  c.textAlign = 'center'
  c.fillText('560 × 340', sx + sw / 2, sy + sh + 40)
  c.textAlign = 'left'

  // smart guides
  c.strokeStyle = '#ff3d8b'
  c.lineWidth = 2
  c.setLineDash([8, 6])
  c.beginPath()
  c.moveTo(ax + aw / 2, 84); c.lineTo(ax + aw / 2, H)
  c.stroke()
  c.strokeStyle = '#22d3ee'
  c.beginPath()
  c.moveTo(114, ay + 256); c.lineTo(1560, ay + 256)
  c.stroke()
  c.setLineDash([])

  return cv
}

/* ------------------------------------------------------------------ the model */

/**
 * Graphic design = a 16"-class pen display: slim black slab, thin even bezels, one tiny power
 * button on the edge, propped on fold-out legs at 25° like a drawing desk, a pen with two side
 * buttons lying beside it, and a poster/logo in progress on the screen. No logos anywhere.
 */
export function PenDisplayModel({ size }: { item: ModelShowcaseItem; size: number }) {
  const Wd = size * 1.3 // body width
  const b = Wd * 0.032 // bezel, equal all round
  const sw = Wd - 2 * b // screen width
  const sh = (sw * 9) / 16
  const Hd = sh + 2 * b // body height
  const T = Wd * 0.03 // thickness
  const alpha = (25 * Math.PI) / 180 // incline from the desk

  const body = useMemo(() => roundedSlabGeometry(Wd, Hd, T, Wd * 0.022, T * 0.18), [Wd, Hd, T])
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#17181b', roughness: 0.42, metalness: 0.45 }), [])
  const rubberMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e0e10', roughness: 0.9, metalness: 0 }), [])
  const buttonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2b30', roughness: 0.35, metalness: 0.6 }), [])
  const penMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.4, metalness: 0.35 }), [])
  const gripMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b2c31', roughness: 0.85, metalness: 0.05 }), [])
  const penBtnMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a8d96', roughness: 0.35, metalness: 0.7 }), [])
  const nibMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cfd2d8', roughness: 0.3, metalness: 0.8 }), [])

  const screenTex = useMemo(() => {
    const t = new THREE.CanvasTexture(drawScreen())
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [])
  // ---- fold-out legs (desk space: y up, z towards the viewer; the display's lower edge sits at z = zf)
  const zf = Wd * 0.1
  const hingeDist = Hd * 0.72 // along the display, from its lower edge
  const hinge = new THREE.Vector3(0, hingeDist * Math.sin(alpha), zf - hingeDist * Math.cos(alpha))
  const phi = (30 * Math.PI) / 180 // how far the legs splay back from vertical
  const legLen = hinge.y / Math.cos(phi)
  const legDir = new THREE.Vector3(0, -Math.cos(phi), -Math.sin(phi))
  const legQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), legDir)
  const legX = Wd * 0.3
  const legW = Wd * 0.075
  const legT = Wd * 0.014

  // ---- the pen, lying beside the display (built along +x, tip to the right)
  const Lp = Wd * 0.36
  const rp = Wd * 0.0125
  const penPos = new THREE.Vector3(Wd * 0.42, rp, zf + Wd * 0.2)

  return (
    // the whole desk set-up is turned a little towards the viewer so the screen reads from the front
    <group position={[0, -Wd * 0.2, 0]} rotation={[0.72, 0, 0]}>
      <group position={[0, 0, -zf * 0.4 - Wd * 0.1]}>
        {/* display, pivoting on its lower back edge */}
        <group position={[0, 0, zf]} rotation={[-(Math.PI / 2 - alpha), 0, 0]}>
          <mesh geometry={body} material={bodyMat} position={[0, Hd / 2, T / 2]} />
          {/* screen */}
          <mesh position={[0, Hd / 2, T + 0.0006]}>
            <planeGeometry args={[sw, sh]} />
            <meshBasicMaterial map={screenTex} toneMapped={false} />
          </mesh>
          {/* hairline inner frame so the glass reads as sunk into the bezel */}
          <mesh position={[0, Hd / 2, T + 0.0003]}>
            <planeGeometry args={[sw + Wd * 0.006, sh + Wd * 0.006]} />
            <meshBasicMaterial color="#050506" toneMapped={false} />
          </mesh>
          {/* the one tiny power button, on the right edge near the top */}
          <mesh material={buttonMat} position={[Wd / 2 + Wd * 0.0018, Hd * 0.78, T / 2]}>
            <boxGeometry args={[Wd * 0.006, Wd * 0.024, T * 0.34]} />
          </mesh>
          {/* rubber feet on the lower back edge */}
          {[-1, 1].map((s) => (
            <mesh key={s} material={rubberMat} position={[s * Wd * 0.4, Wd * 0.006, -Wd * 0.002]}>
              <boxGeometry args={[Wd * 0.07, Wd * 0.012, Wd * 0.012]} />
            </mesh>
          ))}
        </group>

        {/* fold-out legs + their hinge bar */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * legX, hinge.y, hinge.z]} quaternion={legQuat}>
            <mesh material={bodyMat} position={[0, -legLen / 2, 0]}>
              <boxGeometry args={[legW, legLen, legT]} />
            </mesh>
            <mesh material={rubberMat} position={[0, -legLen + legT * 0.4, 0]}>
              <boxGeometry args={[legW * 1.05, legT * 1.6, legT * 1.7]} />
            </mesh>
          </group>
        ))}
        <mesh material={bodyMat} position={[0, hinge.y, hinge.z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[legT * 0.55, legT * 0.55, legX * 2 + legW, 16]} />
        </mesh>

        {/* the pen: nib, grip, barrel with two side buttons, eraser end */}
        <group position={penPos} rotation={[0, -0.42, 0]}>
          <mesh material={penMat} rotation={[0, 0, Math.PI / 2]} position={[-Lp * 0.04, 0, 0]}>
            <cylinderGeometry args={[rp, rp, Lp * 0.78, 28]} />
          </mesh>
          <mesh material={gripMat} rotation={[0, 0, Math.PI / 2]} position={[Lp * 0.28, 0, 0]}>
            <cylinderGeometry args={[rp * 1.08, rp * 1.08, Lp * 0.26, 28]} />
          </mesh>
          <mesh material={penMat} rotation={[0, 0, -Math.PI / 2]} position={[Lp * 0.5, 0, 0]}>
            <coneGeometry args={[rp, Lp * 0.12, 28]} />
          </mesh>
          <mesh material={nibMat} rotation={[0, 0, -Math.PI / 2]} position={[Lp * 0.585, 0, 0]}>
            <coneGeometry args={[rp * 0.28, Lp * 0.06, 16]} />
          </mesh>
          <mesh material={penMat} rotation={[0, 0, Math.PI / 2]} position={[-Lp * 0.46, 0, 0]}>
            <cylinderGeometry args={[rp * 0.96, rp * 0.9, Lp * 0.08, 28]} />
          </mesh>
          {/* the two side buttons */}
          {[0.12, 0.2].map((x) => (
            <mesh key={x} material={penBtnMat} position={[Lp * x, rp * 0.98, 0]}>
              <boxGeometry args={[Lp * 0.065, rp * 0.42, rp * 0.86]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
