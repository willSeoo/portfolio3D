import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { StudioEnvironment } from '../project-card-3d/StudioEnvironment'
import { ArrowButton } from './ArrowButton'
import { Caption } from './Caption'
import { ConfirmPopup } from './ConfirmPopup'
import { Navbar } from './Navbar'
import './showcase.css'
import { PhotoShowcase } from './PhotoShowcase'
import { SketchfabEmbed } from './SketchfabEmbed'
import { ENTER_MS, LEAVE_MS, useCarousel } from './useCarousel'
import { ModelStage } from './models/ModelStage'
import { playOpen } from './sound'
import { heroZoom } from './heroZoom'

const REST: CSSProperties = { transform: 'translateX(0) scale(1)', opacity: 1, transition: 'none' }

interface SceneProps {
  /** The portfolio page draws its own (morphing) navbar over the hero, so it turns this one off. */
  showNav?: boolean
  /** Pause WebGL rendering while the hero is off-screen. */
  active?: boolean
}

export function ShowcaseScene({ showNav = true, active = true }: SceneProps) {
  const { index, item, phase, direction, next, prev, isBusy } = useCarousel()
  const [popupOpen, setPopupOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>(REST)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (phase === 'leaving') {
      setStyle({
        transform: `translateX(${direction * -60}px) scale(0.82) rotate(${direction * -3}deg)`,
        opacity: 0,
        transition: `transform ${LEAVE_MS}ms cubic-bezier(.5,0,.85,.15), opacity ${LEAVE_MS}ms ease-in`,
      })
    } else if (phase === 'entering') {
      setFlash(true)
      const tf = window.setTimeout(() => setFlash(false), 140)
      // snap to the incoming start position with no transition, then animate in next frame
      setStyle({ transform: `translateX(${direction * 60}px) scale(0.82) rotate(${direction * 3}deg)`, opacity: 0, transition: 'none' })
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle({
            transform: 'translateX(0) scale(1) rotate(0deg)',
            opacity: 1,
            // "back" easing: overshoots slightly past scale(1) before settling — the snap/crunch
            transition: `transform ${ENTER_MS}ms cubic-bezier(.34,1.56,.64,1), opacity ${Math.min(ENTER_MS, 160)}ms ease-out`,
          })
        })
      })
      return () => {
        cancelAnimationFrame(raf1)
        window.clearTimeout(tf)
        setFlash(false) // never leave the white flash stuck on if this phase ends before its timer fires
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
    if (heroZoom.docked) {
      // inside bento #1 a tap means "back to home"; dragging still spins the model
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (isBusy()) return
    playOpen()
    setPopupOpen(true)
  }

  // Remounts just the model group (not the whole Canvas) when the item changes,
  // so each model starts fresh with no leftover spin/orientation — the Canvas
  // itself, and its camera/viewport, stays alive across every slide, model or
  // not, so nothing has to re-measure itself and drift on the way back around.
  const stageKey = useMemo(() => `${item.id}-${index}`, [item.id, index])

  return (
    <div className="sc-root">
      {showNav && <Navbar />}
      <div className="sc-viewport">
        <div className="sc-stage" style={style}>
          <Canvas
            // The canvas reaches past the stage up to the top/bottom of the screen (behind the nav and
            // the caption), so a rotated model is never sliced off by a hard edge. ModelStage keeps the
            // model the same size and centred on the stage.
            style={{ position: 'absolute', left: 0, right: 0, top: '-6.5rem', bottom: '-9rem', height: 'auto' }}
            dpr={[1, 1.5]}
            // measure the untransformed layout size: the portfolio page scales this whole scene with a
            // CSS transform, and getBoundingClientRect (the default) would report the shrunken size
            resize={{ scroll: false, offsetSize: true }}
            frameloop={active ? 'always' : 'never'}
            gl={{ antialias: true }}
            camera={{ position: [0, 0, 4.2], fov: 32 }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 0.72 // the studio environment is bright; keep paper/glass from blowing out
            }}
          >
            <StudioEnvironment intensity={0.8} />
            <ambientLight intensity={0.22} />
            <directionalLight position={[3, 4, 5]} intensity={0.75} />
            <directionalLight position={[-4, -2, 2]} intensity={0.2} />
            {item.kind === 'model' && <ModelStage key={stageKey} item={item} onOpenPopup={openPopup} />}
          </Canvas>
          {item.kind === 'embed' && <SketchfabEmbed item={item} onOpen={openPopup} />}
          {item.kind === 'photo' && <PhotoShowcase item={item} onOpen={openPopup} />}
          <div className="sc-flash" style={{ opacity: flash ? 0.35 : 0 }} />
        </div>

        <ArrowButton direction="left" label="Previous" onClick={prev} />
        <ArrowButton direction="right" label="Next" onClick={next} />
      </div>

      <Caption item={item} />

      {popupOpen && <ConfirmPopup item={item} onClose={() => setPopupOpen(false)} />}
    </div>
  )
}
