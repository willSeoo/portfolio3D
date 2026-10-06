import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ModelShowcaseItem } from '../types'
import { roundedFaceGeometry, roundedSlabGeometry } from './geometry'
import { useScreenTexture } from './useScreenTexture'

/**
 * An iPhone 17 Pro-style mockup in a dark "deep blue" finish: flat aluminium unibody
 * frame, thin bezels, Dynamic-Island pill, the wide full-width camera plateau with a
 * three-lens triangle, Action / volume / side / Camera Control buttons — and no logo
 * anywhere. `item.thumbnail` goes on the screen, cropped to fill.
 */
export function PhoneModel({ item, size }: { item: ModelShowcaseItem; size: number }) {
  const height = size
  const width = height * 0.482
  const depth = width * 0.092 // slim
  const bevel = depth * 0.2
  const radius = width * 0.17

  const rim = width * 0.012
  const glassW = width - 2 * bevel - 2 * rim
  const glassH = height - 2 * bevel - 2 * rim
  const glassR = radius - bevel - rim
  const inset = width * 0.014 // thin bezels
  const screenW = glassW - 2 * inset
  const screenH = glassH - 2 * inset
  const screenR = glassR - inset

  const frame = useMemo(() => roundedSlabGeometry(width, height, depth, radius, bevel), [width, height, depth, radius, bevel])
  const glass = useMemo(() => roundedFaceGeometry(glassW, glassH, glassR), [glassW, glassH, glassR])
  const screen = useMemo(() => roundedFaceGeometry(screenW, screenH, screenR), [screenW, screenH, screenR])
  const island = useMemo(() => roundedFaceGeometry(width * 0.27, width * 0.078, width * 0.039), [width])

  const screenTexture = useScreenTexture(item.thumbnail, item.title, item.tone, screenW / screenH)

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#39435c', metalness: 0.82, roughness: 0.36 }), [])
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#040405', roughness: 0.2, metalness: 0, specularIntensity: 0.35, clearcoat: 0.25, clearcoatRoughness: 0.15 }), [])
  const backGlassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3b445d', roughness: 0.44, metalness: 0.55 }), [])
  // the lower back panel: frosted (matte) glass, no sheen — what sits under the camera plateau
  const matteMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#353c57', roughness: 0.93, metalness: 0.03, specularIntensity: 0.22 }), [])
  const screenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: screenTexture, emissiveMap: screenTexture, emissive: '#ffffff', emissiveIntensity: 0.75, roughness: 0.35, metalness: 0 }),
    [screenTexture],
  )
  const blackMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#020203', roughness: 0.3 }), [])

  const eps = 0.0004
  const front = depth / 2

  // side buttons: [x side, y (fraction of height), length (fraction of height)]
  const buttons: [number, number, number][] = [
    [-1, 0.28, 0.03], // Action button
    [-1, 0.2, 0.062], // volume up
    [-1, 0.115, 0.062], // volume down
    [1, 0.19, 0.1], // side button
    [1, -0.14, 0.05], // Camera Control
  ]
  const buttonGeo = useMemo(() => new RoundedBoxGeometry(0.014, 1, depth * 0.34, 3, 0.005), [depth])

  // back camera plateau: a raised, rounded block across the top of the back
  const bumpW = width * 0.9
  const bumpH = width * 0.6
  const bumpDepth = width * 0.036
  const bumpTopGap = width * 0.012
  const bump = useMemo(() => roundedSlabGeometry(bumpW, bumpH, bumpDepth, width * 0.14, bumpDepth * 0.3), [bumpW, bumpH, bumpDepth, width])
  const bumpMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3c455f', roughness: 0.38, metalness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.4 }), [])
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#69728c', metalness: 0.95, roughness: 0.3 }), [])
  const lensMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#06090f', roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03 }), [])
  const flashMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e9e4d6', roughness: 0.4 }), [])
  const lr = width * 0.095
  // [x, y] in units of `width` from the plateau's centre — two on the left (top, bottom), one beside them
  const lenses: [number, number][] = [
    [-0.31, 0.11],
    [-0.105, -0.02],
    [-0.31, -0.145],
  ]

  // matte panel under the plateau (no logo on it)
  const plateauBottom = height / 2 - bumpTopGap - bumpH
  const panelTop = plateauBottom - width * 0.075
  const panelBottom = -height / 2 + width * 0.05
  const panelW = width * 0.89
  const panelH = panelTop - panelBottom
  const panelY = (panelTop + panelBottom) / 2
  const panel = useMemo(() => roundedSlabGeometry(panelW, panelH, 0.0035, width * 0.12, 0.0012), [panelW, panelH, width])

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
        <mesh geometry={panel} material={matteMat} position={[0, panelY, 0.0018]} />
        <group position={[0, height / 2 - bumpH / 2 - bumpTopGap, 0]}>
          <mesh geometry={bump} material={bumpMat} position={[0, 0, bumpDepth / 2]} />
          {lenses.map(([lx, ly], i) => (
            <group key={i} position={[lx * width, ly * width, bumpDepth]}>
              <mesh material={ringMat} position={[0, 0, bumpDepth * 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[lr, lr, bumpDepth * 0.36, 48]} />
              </mesh>
              <mesh material={lensMat} position={[0, 0, bumpDepth * 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[lr * 0.74, lr * 0.74, bumpDepth * 0.4, 48]} />
              </mesh>
            </group>
          ))}
          {/* flash, microphone, LiDAR */}
          <mesh material={flashMat} position={[0.3 * width, 0.12 * width, bumpDepth + 0.001]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[width * 0.036, width * 0.036, 0.004, 28]} />
          </mesh>
          <mesh material={blackMat} position={[0.29 * width, -0.163 * width, bumpDepth + 0.001]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[width * 0.036, width * 0.036, 0.004, 28]} />
          </mesh>
          <mesh material={blackMat} position={[0.297 * width, -0.02 * width, bumpDepth + 0.001]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[width * 0.008, width * 0.008, 0.004, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
