import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Procedural reflection environment (no HDRI fetch): this is what makes the cards'
 * clearcoat actually catch and move light as they turn, instead of a faked gradient.
 */
export function StudioEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture
    scene.environmentIntensity = 1.1
    return () => {
      pmrem.dispose()
      envTexture.dispose()
    }
  }, [gl, scene])
  return null
}
