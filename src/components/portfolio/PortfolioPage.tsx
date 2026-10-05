import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { heroZoom } from '../showcase/heroZoom'
import { ShowcaseScene } from '../showcase/ShowcaseScene'
import { BentoGrid } from './BentoGrid'
import { BentoLightbox } from './BentoLightbox'
import type { BentoItem } from './bentoData'
import { bentoItems } from './bentoData'
import { buildRows } from './layout'
import { clamp, easeInOutSine, lerp, smoothstep } from './math'
import { Navbar } from './Navbar'
import type { NavKey } from './Navbar'
import './portfolio.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Where (px from the top of the screen) bento #1 rests once the transition is complete —
 * just under the compact navbar.
 */
const REST_TOP = 84
/** Model scale (relative to the fullscreen hero) once it sits in its card; ModelStage caps it per model so nothing gets cut off. */
const DOCKED_MODEL_ZOOM = 1.05
/** Where the grid starts (fraction of the viewport height, from the top). Closer to the top → less downward drift. */
const GRID_START = 0.55
/** How front-loaded the grid's rise is vs. the hero's shrink (1 = same pace, higher = grid arrives first). */
const GRID_RISE = 2.4

export function PortfolioPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  const rows = useMemo(() => buildRows(bentoItems), [])
  const [active, setActive] = useState<NavKey>('home')
  const [heroLive, setHeroLive] = useState(true)
  const [lightbox, setLightbox] = useState<{ item: BentoItem; el: HTMLElement } | null>(null)

  const progressRef = useRef(0)
  const catInView = useRef<NavKey | null>(null)
  const activeRef = useRef<NavKey>('home')

  const syncActive = useCallback(() => {
    const next: NavKey = progressRef.current < 0.8 ? 'home' : (catInView.current ?? 'home')
    if (next !== activeRef.current) {
      activeRef.current = next
      setActive(next)
    }
  }, [])

  const goTo = useCallback((key: NavKey) => {
    if (key === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const card = gridRef.current?.querySelector<HTMLElement>(`[data-cat="${key}"]`)
    const row = card?.parentElement
    const spacer = spacerRef.current
    if (!row || !spacer) return
    // the grid starts right after the spacer; offsets ignore transforms, so this is right even mid-zoom
    window.scrollTo({ top: spacer.offsetHeight + row.offsetTop - REST_TOP, behavior: 'smooth' })
  }, [])

  useLayoutEffect(() => {
    const spacer = spacerRef.current!
    const box = boxRef.current!
    const stage = stageRef.current!
    const hero = heroRef.current!
    const layer = layerRef.current!
    const slot = slotRef.current!
    const grid = gridRef.current!
    const nav = navRef.current!

    /*
     * THE IDEA — two things move at once and meet exactly at the end:
     *  1. the grid (one pinned wrapper, `stage`) rises from the bottom edge up to its resting place;
     *  2. the fullscreen hero shrinks and travels towards bento #1's *live* position — so it
     *     dips down a little while the grid comes up to meet it, then settles into the card.
     * Both are driven by the same scroll progress, so they land together and reverse together.
     * While this runs the stage is pinned (position: fixed); at the end it drops back into the
     * normal flow in exactly the same spot and the page scrolls natively.
     */
    const m = {
      vw: 0, vh: 0, L: 0,
      slotLX: 0, slotLY: 0, slotW: 0, slotH: 0, radius: 28,
      stageCx: 0, stageCy: 0, stageH: 1,
    }
    let mode: 'zoom' | 'rest' | null = null

    /**
     * Fit the viewport-sized hero composition into a w × h box (the slot, in its own pixels).
     * e = 0 → the whole composition is fitted (the fullscreen hero); e = 1 → only the 3D stage is kept, centred, with its height
     * filling the box (no caption, no arrows).
     */
    const fitLayer = (w: number, h: number, e: number) => {
      const sFull = Math.min(w / m.vw, h / m.vh)
      const sStage = h / m.stageH
      const s = lerp(sFull, sStage, e)
      const cx = lerp(m.vw / 2, m.stageCx, e)
      const cy = lerp(m.vh / 2, m.stageCy, e)
      layer.style.transform = `translate3d(${(w / 2 - cx * s).toFixed(2)}px, ${(h / 2 - cy * s).toFixed(2)}px, 0) scale(${s.toFixed(5)})`
    }

    const measure = () => {
      m.vw = document.documentElement.clientWidth
      m.vh = window.innerHeight
      m.L = Math.round(clamp(m.vh * 0.68, 420, 720)) // scroll distance of the transition
      spacer.style.height = `${m.L + REST_TOP}px`
      layer.style.width = `${m.vw}px`
      layer.style.height = `${m.vh}px`

      // Measure the real, untransformed layout.
      stage.classList.remove('is-pinned')
      stage.style.transform = 'none'
      box.style.height = ''
      const boxH = stage.offsetHeight
      box.style.height = `${boxH}px`
      const wr = stage.getBoundingClientRect()
      const r = slot.getBoundingClientRect()
      m.slotLX = r.left - wr.left
      m.slotLY = r.top - wr.top
      m.slotW = r.width
      m.slotH = r.height
      m.radius = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 28

      // The 3D stage inside the composition (the part that stays when docked).
      const st = layer.querySelector<HTMLElement>('.sc-viewport')
      if (st) {
        m.stageCx = st.offsetLeft + st.offsetWidth / 2
        m.stageCy = st.offsetTop + st.offsetHeight / 2
        m.stageH = Math.max(st.offsetHeight, 1)
      } else {
        m.stageCx = m.vw / 2
        m.stageCy = m.vh / 2
        m.stageH = m.vh
      }

      // The nav bar is full-width when stuck, but its content lines up with the grid's edges.
      const gridW = grid.getBoundingClientRect().width
      nav.style.setProperty('--nav-pad', `${Math.max((m.vw - gridW) / 2, 16).toFixed(0)}px`)

      // Cards that are on screen once the zoom-out is done must already be there while it
      // happens (they ride in with the zoom) — only the ones further down get the scroll reveal.
      grid.querySelectorAll<HTMLElement>('.pf-card').forEach((c) => {
        const row = c.parentElement as HTMLElement
        c.classList.toggle('no-reveal', row.offsetTop + REST_TOP < m.vh)
      })
      mode = null // force a full restyle on the next apply()
    }

    const setHeroBox = (x: number, y: number, w: number, h: number) => {
      hero.style.left = `${x.toFixed(2)}px`
      hero.style.top = `${y.toFixed(2)}px`
      hero.style.width = `${w.toFixed(2)}px`
      hero.style.height = `${h.toFixed(2)}px`
    }

    const apply = () => {
      const p = clamp(window.scrollY / m.L)
      progressRef.current = p
      nav.style.setProperty('--np', smoothstep(0, 0.7, p).toFixed(4))

      if (p >= 0.9999) {
        if (mode !== 'rest') {
          mode = 'rest'
          stage.classList.remove('is-pinned')
          stage.style.transform = 'none'
          setHeroBox(0, 0, m.slotW, m.slotH)
          hero.style.borderRadius = `${m.radius}px`
          hero.style.setProperty('--dock', '1')
          hero.classList.add('is-docked')
          heroZoom.docked = true
        }
        fitLayer(m.slotW, m.slotH, 1)
        heroZoom.value = DOCKED_MODEL_ZOOM
      } else {
        mode = 'zoom'
        const e = easeInOutSine(p)

        // 1) the grid rises fast (ahead of the hero) from a point already well inside the screen
        const g = 1 - Math.pow(1 - e, GRID_RISE)
        const ty = lerp(m.vh * GRID_START, REST_TOP, g)
        stage.classList.add('is-pinned')
        stage.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`

        // 2) the hero heads for bento #1's live position (which gets there ahead of it, so the hero is always chasing a card that is already rising)
        const sx = m.slotLX
        const sy = ty + m.slotLY // slot's current top, in screen px
        const hx = lerp(0, sx, e)
        const hy = lerp(0, sy, e)
        const hw = lerp(m.vw, m.slotW, e)
        const hh = lerp(m.vh, m.slotH, e)
        setHeroBox(hx - sx, hy - sy, hw, hh) // hero lives inside the slot, so its box is relative to it
        hero.style.borderRadius = `${lerp(0, m.radius, e).toFixed(2)}px`

        fitLayer(hw, hh, e)
        const d = smoothstep(0.2, 0.75, e) // caption + arrows fade out on the way in
        hero.style.setProperty('--dock', d.toFixed(3))
        hero.classList.toggle('is-docked', d > 0.6)
        heroZoom.docked = d > 0.6
        heroZoom.value = lerp(1, DOCKED_MODEL_ZOOM, e)
      }
      syncActive()
    }

    measure()
    const st = ScrollTrigger.create({
      trigger: rootRef.current!,
      start: 'top top',
      end: () => `+=${m.L}`,
      invalidateOnRefresh: true,
      onUpdate: apply, // exact (no smoothing): scrolling back reverses the move frame by frame
    })
    apply()

    const onRefreshInit = () => measure()
    const onRefresh = () => apply()
    const onResize = () => {
      measure()
      apply()
    }
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit)
    ScrollTrigger.addEventListener('refresh', onRefresh)
    window.addEventListener('resize', onResize)

    // Pause WebGL whenever the hero is off-screen.
    const heroIO = new IntersectionObserver(([en]) => setHeroLive(en.isIntersecting), { threshold: 0 })
    heroIO.observe(hero)

    // Which category is under the top of the screen (drives the active nav link).
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-cat]'))
    const inBand = new Set<HTMLElement>()
    const catIO = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) inBand.add(en.target as HTMLElement)
          else inBand.delete(en.target as HTMLElement)
        }
        // topmost card in the band wins; on a tie, the leftmost (so the hero card reads as "home")
        let best: DOMRect | null = null
        let bestCat: NavKey | null = null
        inBand.forEach((el) => {
          const r = el.getBoundingClientRect()
          if (!best || r.top < best.top - 4 || (Math.abs(r.top - best.top) <= 4 && r.left < best.left)) {
            best = r
            bestCat = el.dataset.cat as NavKey
          }
        })
        catInView.current = bestCat
        syncActive()
      },
      { rootMargin: '-28% 0px -58% 0px' },
    )
    cards.forEach((c) => catIO.observe(c))

    // Cards fade/slide in as the grid rises into view (and back out when it leaves).
    const revealIO = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.target.classList.toggle('is-in', en.isIntersecting)),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    cards.forEach((c) => revealIO.observe(c))

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      window.removeEventListener('resize', onResize)
      heroIO.disconnect()
      catIO.disconnect()
      revealIO.disconnect()
      st.kill()
      heroZoom.value = 1
      heroZoom.docked = false
    }
  }, [syncActive])

  // Docked in bento #1: a tap (not a drag) anywhere on the card scrolls back to the top;
  // dragging on the model still spins it.
  const heroDown = useRef({ x: 0, y: 0 })
  const onHeroDown = useCallback((e: React.PointerEvent) => {
    heroDown.current = { x: e.clientX, y: e.clientY }
  }, [])
  const onHeroClick = useCallback((e: React.MouseEvent) => {
    if (!heroZoom.docked) return
    if (Math.hypot(e.clientX - heroDown.current.x, e.clientY - heroDown.current.y) > 6) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openCard = useCallback((item: BentoItem, el: HTMLElement) => setLightbox({ item, el }), [])

  return (
    <div className="pf" ref={rootRef}>
      <Navbar navRef={navRef} active={active} onNavigate={goTo} />

      {/* Scroll runway for the zoom-out (height set from JS). */}
      <div className="pf-spacer" ref={spacerRef} aria-hidden="true" />

      <main className="pf-main">
        {/* The in-flow placeholder keeps the page height while the stage is pinned (fixed) during the zoom. */}
        <div className="pf-gridbox" ref={boxRef}>
          <div className="pf-stage" ref={stageRef}>
            <BentoGrid
              rows={rows}
              gridRef={gridRef}
              slotRef={slotRef}
              onOpen={openCard}
              hero={
                <div className="pf-hero" ref={heroRef} onPointerDownCapture={onHeroDown} onClick={onHeroClick}>
                  <div className="pf-hero__layer" ref={layerRef}>
                    <ShowcaseScene showNav={false} active={heroLive} />
                  </div>
                </div>
              }
            />
          </div>
        </div>
        <footer className="pf-footer">
          <span>© 2026</span>
          <span>Built with React Three Fiber</span>
        </footer>
      </main>

      {lightbox && <BentoLightbox item={lightbox.item} originEl={lightbox.el} onClosed={() => setLightbox(null)} />}
    </div>
  )
}
