import { useRef } from 'react'
import { BentoGrid } from './components/bento/BentoGrid'
import { HeroTransition } from './components/hero-transition/HeroTransition'
import { Navbar } from './components/showcase/Navbar'
import { ShowcaseScene } from './components/showcase/ShowcaseScene'

/** Page shell: nav persists across both sections; the fullscreen hero
 *  scroll-shrinks into Bento Box #1 as the grid scrolls into view. */
export default function Page() {
  const firstBentoRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Navbar />
      <HeroTransition targetRef={firstBentoRef}>
        <ShowcaseScene />
      </HeroTransition>
      <BentoGrid firstCardRef={firstBentoRef} />
    </>
  )
}
