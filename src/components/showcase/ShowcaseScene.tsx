import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { StudioEnvironment } from '../project-card-3d/StudioEnvironment'
import { ArrowButton } from './ArrowButton'
import { Caption } from './Caption'
import { ConfirmPopup } from './ConfirmPopup'
import './showcase.css'
import { SketchfabEmbed } from './SketchfabEmbed'
import { ENTER_MS, LEAVE_MS, useCarousel } from './useCarousel'
import { ModelStage } from './models/ModelStage'
import { playOpen } from './sound'

const REST: CSSProperties = { transform: 'translateX(0) scale(1)', opacity: 1, transition: 'none' }

export function ShowcaseScene() {
  const { index, item, phase, direction, next, prev, isBusy } = useCarousel()
  const [popupOpen, setPopupOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>(REST)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (phase === 'leaving') {
      setStyle({
        transform: `translateX(${direction * -46}px) scale(0.86)`,
        opacity: 0,
        transition: `transform ${LEAVE_MS}ms cubic-bezier(.4,0,.7,.3), opacity ${LEAVE_MS}ms ease`,
      })
    } else if (phase === 'entering') {
      setFlash(true)
      const tf = window.setTimeout(() => setFlash(false), 170)
      // snap to the incoming start position with no transition, then animate in next frame
      setStyle({ transform: `translateX(${direction * 46}px) scale(0.86)`, opacity: 0, transition: 'none' })
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle({
            transform: 'translateX(0) scale(1)',
            opacity: 1,
            transition: `transform ${ENTER_MS}ms cubic-bezier(.2,.8,.2,1), opacity ${ENTER_MS}ms ease`,
          })
        })
      })
      return () => {
        cancelAnimationFrame(raf1)
        window.clearTimeout(tf)
      }
    } else {
      setStyle(REST)
    }
  }, [phase, direction])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (popupOpen) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, popupOpen])

  const openPopup = () => {
    if (isBusy()) return
    playOpen()
    setPopupOpen(true)
  }

  // Remounts the WebGL model group when the item changes so each model starts
  // fresh (no leftover spin/orientation carried over from the previous card).
  const stageKey = useMemo(() => `${item.id}-${index}`, [item.id, index])

  return (
    <div className="sc-root">
      <div className="sc-stage" style={style}>
        {item.kind === 'embed' ? (
          <SketchfabEmbed item={item} />
        ) : (
          <Canvas dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [0, 0, 4.2], fov: 32 }}>
            <StudioEnvironment />
            <ambientLight intensity={0.35} />
            <directionalLight position={[3, 4, 5]} intensity={0.9} />
            <directionalLight position={[-4, -2, 2]} intensity={0.25} />
            <ModelStage key={stageKey} item={item} onOpenPopup={openPopup} />
          </Canvas>
        )}
        <div className="sc-flash" style={{ opacity: flash ? 0.35 : 0 }} />
      </div>

      <ArrowButton direction="left" label="Previous" onClick={prev} />
      <ArrowButton direction="right" label="Next" onClick={next} />

      <Caption item={item} onView={openPopup} />

      {popupOpen && <ConfirmPopup item={item} onClose={() => setPopupOpen(false)} />}
    </div>
  )
}
