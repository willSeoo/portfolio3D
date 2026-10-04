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
import { clamp, easeInOutCubic, lerp, smoothstep } from './math'
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

export function PortfolioPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
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
    const row = card?.parentElement // the row never carries a transform, the card can (reveal animation)
    if (!row) return
    window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - REST_TOP, behavior: 'smooth' })
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current!
    const spacer = spacerRef.current!
    const hero = heroRef.current!
    const layer = layerRef.current!
    const slot = slotRef.current!
    const grid = gridRef.current!
    const nav = navRef.current!

    // Everything the animation needs, measured from the real DOM (never hard-coded).
    const m = { vw: 0, vh: 0, L: 0, slotX: 0, slotDocY: 0, slotW: 0, slotH: 0, radius: 28, stageCx: 0, stageCy: 0, stageH: 1 }
    const proxy = { p: 0 }
    let mode: 'fly' | 'dock' | null = null

    /**
     * Place the viewport-sized hero composition inside a w × h box. e = 0 → the whole
     * composition is fitted (fullscreen look); e = 1 → only the 3D stage is shown, its
     * centre on the box centre and its height filling the box, so the card model sits
     * dead-centre in the bento with no caption or arrows around it.
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
      m.L = Math.round(clamp(m.vh * 1.15, 720, 1400)) // scroll distance of the transition

      // Space above the grid: the hero's "fullscreen" lives here. At scrollY = L the first row
      // sits exactly REST_TOP from the top of the screen.
      spacer.style.height = `${m.L + REST_TOP}px`
      layer.style.width = `${m.vw}px`
      layer.style.height = `${m.vh}px`

      // The destination: the real Bento #1 box.
      const r = slot.getBoundingClientRect()
      m.slotX = r.left + window.scrollX
      m.slotDocY = r.top + window.scrollY
      m.slotW = r.width
      m.slotH = r.height
      m.radius = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 28

      // The 3D stage inside the composition (the part that stays when docked).
      const stage = layer.querySelector<HTMLElement>('.sc-viewport')
      if (stage) {
        m.stageCx = stage.offsetLeft + stage.offsetWidth / 2
        m.stageCy = stage.offsetTop + stage.offsetHeight / 2
        m.stageH = Math.max(stage.offsetHeight, 1)
      } else {
        m.stageCx = m.vw / 2
        m.stageCy = m.vh / 2
        m.stageH = m.vh
      }

      // The nav bar is full-width when stuck, but its content lines up with the grid's edges.
      const gridW = grid.getBoundingClientRect().width
      nav.style.setProperty('--nav-pad', `${Math.max((m.vw - gridW) / 2, 16).toFixed(0)}px`)
      mode = null // force a full restyle on the next apply()
    }

    const dock = () => {
      if (mode !== 'dock') {
        mode = 'dock'
        hero.style.position = 'absolute'
        hero.style.left = '0px'
        hero.style.top = '0px'
        hero.style.width = '100%'
        hero.style.height = '100%'
        hero.style.transform = 'none'
        hero.style.borderRadius = `${m.radius}px`
        hero.style.boxShadow = 'none'
        heroZoom.docked = true
        hero.style.setProperty('--dock', '1')
        hero.classList.add('is-docked')
      }
      fitLayer(m.slotW, m.slotH, 1)
      heroZoom.value = DOCKED_MODEL_ZOOM
    }

    const fly = (e: number, y: number) => {
      mode = 'fly'
      // Live rect of Bento #1 on screen right now (it is rising with the page as we scroll).
      const dx = m.slotX
      const dy = m.slotDocY - y
      const x = lerp(0, dx, e)
      const yy = lerp(0, dy, e)
      const w = lerp(m.vw, m.slotW, e)
      const h = lerp(m.vh, m.slotH, e)
      hero.style.position = 'fixed'
      hero.style.left = '0px'
      hero.style.top = '0px'
      hero.style.width = `${w.toFixed(2)}px`
      hero.style.height = `${h.toFixed(2)}px`
      hero.style.transform = `translate3d(${x.toFixed(2)}px, ${yy.toFixed(2)}px, 0)`
      hero.style.borderRadius = `${lerp(0, m.radius, e).toFixed(2)}px`
      hero.style.boxShadow = 'none'
      fitLayer(w, h, e)
      const d = smoothstep(0.2, 0.75, e) // caption + arrows fade out on the way in
      hero.style.setProperty('--dock', d.toFixed(3))
      hero.classList.toggle('is-docked', d > 0.6)
      heroZoom.docked = d > 0.6
      heroZoom.value = lerp(1, DOCKED_MODEL_ZOOM, e)
    }

    const apply = () => {
      const p = clamp(proxy.p)
      progressRef.current = p
      nav.style.setProperty('--np', smoothstep(0, 0.7, p).toFixed(4))
      if (p >= 0.9999) dock()
      else fly(easeInOutCubic(p), window.scrollY)
      syncActive()
    }

    measure()
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      onUpdate: apply,
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${m.L}`,
        scrub: 0.6, // scrubbed to the scrollbar (with a touch of smoothing); reverses by itself
        invalidateOnRefresh: true,
      },
    })
    tween.progress(clamp(window.scrollY / m.L)) // reloaded mid-page? start in the right place
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
      tween.scrollTrigger?.kill()
      tween.kill()
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

      {/* Scroll runway for the transition: the hero is "fullscreen" over this empty space,
          the grid rises out of its bottom edge. Its height is set from JS. */}
      <div className="pf-spacer" ref={spacerRef} aria-hidden="true" />

      <main className="pf-main">
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
        <footer className="pf-footer">
          <span>© 2026</span>
          <span>Built with React Three Fiber</span>
        </footer>
      </main>

      {lightbox && <BentoLightbox item={lightbox.item} originEl={lightbox.el} onClosed={() => setLightbox(null)} />}
    </div>
  )
}
