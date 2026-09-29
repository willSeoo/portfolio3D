import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { roundedFaceGeometry, roundedSlabGeometry } from './geometry'
import { useScreenTexture } from './useScreenTexture'

/**
 * A modern-flagship-phone mockup (flat titanium-style frame, Dynamic-Island
 * style pill, three-lens camera bump, side buttons) — no logos anywhere.
 * `item.thumbnail` goes on the screen, cropped to fill.
 */
export function PhoneModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const height = size
  const width = height * 0.482
  const depth = width * 0.115
  const bevel = depth * 0.16
  const radius = width * 0.155

  const rim = width * 0.012
  const glassW = width - 2 * bevel - 2 * rim
  const glassH = height - 2 * bevel - 2 * rim
  const glassR = radius - bevel - rim
  const inset = width * 0.03
  const screenW = glassW - 2 * inset
  const screenH = glassH - 2 * inset
  const screenR = glassR - inset

  const frame = useMemo(() => roundedSlabGeometry(width, height, depth, radius, bevel), [width, height, depth, radius, bevel])
  const glass = useMemo(() => roundedFaceGeometry(glassW, glassH, glassR), [glassW, glassH, glassR])
  const screen = useMemo(() => roundedFaceGeometry(screenW, screenH, screenR), [screenW, screenH, screenR])
  const island = useMemo(() => roundedFaceGeometry(width * 0.27, width * 0.078, width * 0.039), [width])

  const screenTexture = useScreenTexture(item.thumbnail, item.title, item.tone, screenW / screenH)

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#77746f', metalness: 0.92, roughness: 0.3 }), [])
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#040405', roughness: 0.2, metalness: 0, specularIntensity: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.15 }), [])
  const backGlassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#34353a', roughness: 0.55, metalness: 0.15, clearcoat: 0.3, clearcoatRoughness: 0.5 }), [])
  const screenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: screenTexture, emissiveMap: screenTexture, emissive: '#ffffff', emissiveIntensity: 0.75, roughness: 0.35, metalness: 0 }),
    [screenTexture],
  )
  const blackMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#020203', roughness: 0.3 }), [])

  const eps = 0.0004
  const front = depth / 2

  // side buttons: [x side, y (fraction of height), length (fraction of height)]
  const buttons: [number, number, number][] = [
    [-1, 0.27, 0.035],
    [-1, 0.17, 0.07],
    [-1, 0.06, 0.07],
    [1, 0.16, 0.1],
  ]
  const buttonGeo = useMemo(() => new RoundedBoxGeometry(0.016, 1, depth * 0.38, 3, 0.006), [depth])

  // back camera bump
  const bumpW = width * 0.44
  const bumpDepth = width * 0.05
  const bump = useMemo(() => roundedSlabGeometry(bumpW, bumpW, bumpDepth, bumpW * 0.24, bumpDepth * 0.25), [bumpW, bumpDepth])
  const bumpMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3c3d42', roughness: 0.25, metalness: 0.35, clearcoat: 0.8 }), [])
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a8782', metalness: 0.95, roughness: 0.25 }), [])
  const lensMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#0a1020', roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03 }), [])
  const flashMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f1ead8', roughness: 0.4 }), [])
  const lr = bumpW * 0.2
  const lenses: [number, number][] = [
    [-0.21, 0.2],
    [-0.21, -0.2],
    [0.2, 0],
  ]

  return (
    <group>
      <mesh geometry={frame} material={frameMat} />

      {/* front: black glass, then the screen, then the pill */}
      <mesh geometry={glass} material={glassMat} position={[0, 0, front + eps]} />
      <mesh geometry={screen} material={screenMat} position={[0, 0, front + eps * 2.2]} />
      <mesh geometry={island} material={blackMat} position={[0, screenH / 2 - width * 0.045 - width * 0.039, front + eps * 3.4]} />

      {/* side buttons */}
      {buttons.map(([side, y, len], i) => (
        <mesh key={i} geometry={buttonGeo} material={frameMat} position={[side * (width / 2 + 0.0004), y * height, 0]} scale={[1, len * height, 1]} />
      ))}

      {/* back: viewed from behind, +x is the viewer's right */}
      <group rotation={[0, Math.PI, 0]} position={[0, 0, -front]}>
        <mesh geometry={glass} material={backGlassMat} position={[0, 0, eps]} />
        <group position={[-(width / 2 - width * 0.06 - bumpW / 2), height / 2 - width * 0.06 - bumpW / 2, 0]}>
          <mesh geometry={bump} material={bumpMat} position={[0, 0, bumpDepth / 2]} />
          {lenses.map(([lx, ly], i) => (
            <group key={i} position={[lx * bumpW, ly * bumpW, bumpDepth]}>
              <mesh material={ringMat} position={[0, 0, bumpDepth * 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[lr, lr, bumpDepth * 0.36, 40]} />
              </mesh>
              <mesh material={lensMat} position={[0, 0, bumpDepth * 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[lr * 0.72, lr * 0.72, bumpDepth * 0.4, 40]} />
              </mesh>
            </group>
          ))}
          <mesh material={flashMat} position={[0.25 * bumpW, 0.31 * bumpW, bumpDepth + 0.001]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[bumpW * 0.065, bumpW * 0.065, 0.004, 24]} />
          </mesh>
          <mesh material={blackMat} position={[0.28 * bumpW, -0.3 * bumpW, bumpDepth + 0.001]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[bumpW * 0.05, bumpW * 0.05, 0.004, 24]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
