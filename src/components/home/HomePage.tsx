import { useRef, useState } from 'react'
import { Navbar } from '../showcase/Navbar'
import '../showcase/showcase.css'
import { BentoGrid } from './BentoGrid'
import { BentoLightbox } from './BentoLightbox'
import { bentoItems } from './bentoData'
import './home.css'

export function HomePage() {
  const spacerRef = useRef<HTMLDivElement>(null)
  const [openItem, setOpenItem] = useState<(typeof bentoItems)[number] | null>(null)

  return (
    <div className="home">
      <Navbar />
      <div ref={spacerRef} className="hero-spacer" aria-hidden="true" />
      <BentoGrid items={bentoItems} heroTargetId="about" spacerRef={spacerRef} onOpen={setOpenItem} />
      {openItem && <BentoLightbox item={openItem} onClose={() => setOpenItem(null)} />}
    </div>
  )
}
