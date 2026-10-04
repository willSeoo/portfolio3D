import type { RefObject } from 'react'
import { BentoCard } from './BentoCard'
import type { BentoItem } from './bentoData'
import { HeroBentoCard } from './HeroBentoCard'

interface Props {
  items: BentoItem[]
  onOpen: (item: BentoItem) => void
  heroTargetId: string
  spacerRef: RefObject<HTMLDivElement | null>
}

export function BentoGrid({ items, onOpen, heroTargetId, spacerRef }: Props) {
  return (
    <section className="bento-section">
      <div className="bento-grid">
        {items.map((item) =>
          item.id === heroTargetId ? (
            <HeroBentoCard key={item.id} item={item} spacerRef={spacerRef} onOpen={onOpen} />
          ) : (
            <BentoCard key={item.id} item={item} onOpen={onOpen} />
          ),
        )}
      </div>
    </section>
  )
}
