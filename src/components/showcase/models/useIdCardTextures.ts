import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { loadImage } from '../../project-card-3d/textureUtils'
import type { ModelShowcaseItem } from '../types'
import { ID_H, ID_W, drawIdBack, drawIdFront } from './drawIdCard'
import { idCardConfig } from './idCard.config'

function makeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = ID_W
  canvas.height = ID_H
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return { canvas, texture }
}

/**
 * Front/back textures for the ID card. Drawn immediately with placeholders
 * (so the first frame already looks right), then redrawn once the photo(s)
 * from `item.thumbnail` / `item.backImage` finish loading.
 */
export function useIdCardTextures(item: ModelShowcaseItem) {
  const front = useMemo(() => {
    const t = makeTexture()
    drawIdFront(t.canvas, idCardConfig, null)
    return t
  }, [])
  const back = useMemo(() => {
    const t = makeTexture()
    drawIdBack(t.canvas, idCardConfig, null)
    return t
  }, [])

  useEffect(() => {
    let cancelled = false
    if (item.thumbnail) {
      void loadImage(item.thumbnail).then((img) => {
        if (cancelled || !img) return
        drawIdFront(front.canvas, idCardConfig, img)
        front.texture.needsUpdate = true
      })
    } else {
      drawIdFront(front.canvas, idCardConfig, null)
      front.texture.needsUpdate = true
    }
    if (item.backImage) {
      void loadImage(item.backImage).then((img) => {
        if (cancelled || !img) return
        drawIdBack(back.canvas, idCardConfig, img)
        back.texture.needsUpdate = true
      })
    } else {
      drawIdBack(back.canvas, idCardConfig, null)
      back.texture.needsUpdate = true
    }
    return () => {
      cancelled = true
    }
  }, [item.thumbnail, item.backImage, front, back])

  return { front: front.texture, back: back.texture }
}
