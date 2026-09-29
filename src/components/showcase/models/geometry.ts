import * as THREE from 'three'

/** A rounded rectangle outline centered on the origin (counter-clockwise, so it faces +z). */
export function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const rr = Math.max(0.0001, Math.min(r, w / 2, h / 2))
  const x = -w / 2
  const y = -h / 2
  const s = new THREE.Shape()
  s.moveTo(x + rr, y)
  s.lineTo(x + w - rr, y)
  s.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - rr)
  s.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false)
  s.lineTo(x + rr, y + h)
  s.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + rr)
  s.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false)
  return s
}

/**
 * A flat rounded-rect face with UVs normalised to 0..1, so a texture (or a
 * canvas drawing) maps across it edge to edge. Faces +z.
 */
export function roundedFaceGeometry(w: number, h: number, r: number): THREE.ShapeGeometry {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 24)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h)
  uv.needsUpdate = true
  return geo
}

/**
 * A slab with a real planar corner radius `r` (unlike RoundedBoxGeometry, whose
 * radius can't exceed half the thickness) and a small bevel `b` on both faces.
 * Outer size is exactly w x h x depth, centered on the origin. The flat caps
 * are (w-2b) x (h-2b) — put face planes there.
 */
export function roundedSlabGeometry(w: number, h: number, depth: number, r: number, b: number): THREE.ExtrudeGeometry {
  const bevel = Math.min(b, depth / 2 - 0.0001, r - 0.0001)
  const shape = roundedRectShape(w - 2 * bevel, h - 2 * bevel, r - bevel)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 28,
  })
  geo.translate(0, 0, -(depth - 2 * bevel) / 2)
  return geo
}
