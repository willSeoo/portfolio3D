import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { setModelCursor } from '../../cursor/cursorBus'
import { GLOBE_N, INDONESIA_LATLON, LAND_DELTAS } from './globeData'

/** Where I am: Perbaungan, North Sumatra, Indonesia. */
export const HOME_PLACE = { name: 'Perbaungan', region: 'North Sumatra, Indonesia', lat: 3.57, lon: 98.97, timeZone: 'Asia/Jakarta', tzLabel: 'WIB · UTC+7' }
/** The orientation the globe rests in (and eases back to when left alone): Indonesia in the middle. */
const VIEW = { lat: -1.5, lon: 108 }

const D2R = Math.PI / 180
const toVec = (lat: number, lon: number, r = 1) => new THREE.Vector3(r * Math.cos(lat * D2R) * Math.sin(lon * D2R), r * Math.sin(lat * D2R), r * Math.cos(lat * D2R) * Math.cos(lon * D2R))
const Z = new THREE.Vector3(0, 0, 1)

function decodeLand() {
  const pts: [number, number][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  let idx = 0
  for (const d of LAND_DELTAS.split(',')) {
    idx += Number(d)
    const y = 1 - (2 * (idx + 0.5)) / GLOBE_N
    const lat = Math.asin(y) / D2R
    let lon = ((idx * golden) % (2 * Math.PI)) / D2R
    lon = ((lon + 540) % 360) - 180
    pts.push([lat, lon])
  }
  return pts
}

/** A small flat dot lying on the sphere, facing outwards. */
function Dots({ points, radius, color }: { points: [number, number][]; radius: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    points.forEach(([lat, lon], i) => {
      const n = toVec(lat, lon)
      q.setFromUnitVectors(Z, n)
      m.compose(n.clone().multiplyScalar(1.004), q, one)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [points])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, points.length]}>
      <circleGeometry args={[radius, 8]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

/** The "you are here" pin: a solid dot plus two ripples. */
function Marker() {
  const rings = useRef<THREE.Mesh[]>([])
  const { pos, quat } = useMemo(() => {
    const n = toVec(HOME_PLACE.lat, HOME_PLACE.lon)
    return { pos: n.clone().multiplyScalar(1.008), quat: new THREE.Quaternion().setFromUnitVectors(Z, n) }
  }, [])
  useFrame(({ clock }) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return
      const t = ((clock.elapsedTime * 0.55 + i * 0.5) % 1)
      ring.scale.setScalar(1 + t * 2.4)
      ;(ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.55
    })
  })
  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <circleGeometry args={[0.024, 24]} />
        <meshBasicMaterial color="#ff5a2c" />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(el) => { if (el) rings.current[i] = el }} position={[0, 0, -0.0005]}>
          <ringGeometry args={[0.03, 0.037, 40]} />
          <meshBasicMaterial color="#ff5a2c" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

interface SceneProps {
  /** Called on a tap (press + release without dragging). */
  onTap?: () => void
}

function Scene({ onTap }: SceneProps) {
  const land = useMemo(decodeLand, [])
  const indonesia = useMemo(() => {
    const out: [number, number][] = []
    for (let i = 0; i < INDONESIA_LATLON.length; i += 2) out.push([INDONESIA_LATLON[i], INDONESIA_LATLON[i + 1]])
    return out
  }, [])

  const { gl, viewport, size } = useThree()
  const group = useRef<THREE.Group>(null)
  const home = useMemo(() => ({ yaw: -VIEW.lon * D2R, pitch: VIEW.lat * D2R }), [])
  const st = useRef({ yaw: home.yaw, pitch: home.pitch, vy: 0, vp: 0, down: false, lastX: 0, lastY: 0, startX: 0, startY: 0, moved: false, idleSince: 0 })
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap

  // drag to spin, with a little inertia; left alone for a few seconds it eases back to Indonesia
  useEffect(() => {
    const el = gl.domElement
    const s = st.current
    const k = 0.0058
    const down = (e: PointerEvent) => {
      s.down = true
      s.moved = false
      s.lastX = s.startX = e.clientX
      s.lastY = s.startY = e.clientY
      s.vy = s.vp = 0
      el.setPointerCapture?.(e.pointerId)
      setModelCursor('grabbing')
    }
    const move = (e: PointerEvent) => {
      if (!s.down) return
      const dx = e.clientX - s.lastX
      const dy = e.clientY - s.lastY
      s.lastX = e.clientX
      s.lastY = e.clientY
      if (Math.hypot(e.clientX - s.startX, e.clientY - s.startY) > 6) s.moved = true
      s.yaw += dx * k
      s.pitch = THREE.MathUtils.clamp(s.pitch + dy * k, -1.15, 1.15)
      s.vy = dx * k
      s.vp = dy * k
    }
    const up = (e: PointerEvent) => {
      if (!s.down) return
      s.down = false
      s.idleSince = performance.now()
      el.releasePointerCapture?.(e.pointerId)
      setModelCursor('grab')
      if (!s.moved) onTapRef.current?.()
    }
    const enter = () => setModelCursor(s.down ? 'grabbing' : 'grab')
    const leave = () => {
      if (!s.down) setModelCursor(null)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      setModelCursor(null)
    }
  }, [gl])

  useFrame((_, dt) => {
    const s = st.current
    const g = group.current
    if (!g) return
    if (!s.down) {
      s.yaw += s.vy
      s.pitch = THREE.MathUtils.clamp(s.pitch + s.vp, -1.15, 1.15)
      s.vy *= 0.93
      s.vp *= 0.93
      if (Math.abs(s.vy) < 0.0004 && Math.abs(s.vp) < 0.0004 && performance.now() - s.idleSince > 3200) {
        const dYaw = ((home.yaw - s.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI
        const a = 1 - Math.exp(-dt * 2.4)
        s.yaw += dYaw * a
        s.pitch += (home.pitch - s.pitch) * a
      }
    }
    g.rotation.set(s.pitch, s.yaw, 0, 'XYZ')
  })

  // On wide boxes the globe sits right of centre so the text has the left side.
  const aspect = size.width / size.height
  const shiftX = aspect > 1.3 ? 0.14 * viewport.width : 0

  return (
    <>
      <ambientLight intensity={2.3} />
      <directionalLight position={[-2.5, 3, 4]} intensity={1.5} />
      <group position={[shiftX, 0, 0]}>
        <group ref={group}>
          <mesh>
            <sphereGeometry args={[1, 64, 48]} />
            <meshStandardMaterial color="#f3f5f8" roughness={1} />
          </mesh>
          <Dots points={land} radius={0.0112} color="#c7ccd5" />
          <Dots points={indonesia} radius={0.0088} color="#15171c" />
          <Marker />
        </group>
      </group>
    </>
  )
}

/** The interactive globe (fills its parent). Pauses itself while off-screen. */
export function GlobeCanvas({ onTap }: SceneProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={wrap} className="pf-globe">
      <Canvas flat dpr={[1, 2]} camera={{ position: [0, 0, 4.6], fov: 30 }} frameloop={visible ? 'always' : 'never'} resize={{ scroll: false, offsetSize: true }}>
        <Scene onTap={onTap} />
      </Canvas>
    </div>
  )
}
