import type { ReactNode, Ref } from 'react'
import type { BentoItem } from './bentoData'
import { BentoCard } from './BentoCard'
import type { BentoRow } from './layout'

interface Props {
  rows: BentoRow[]
  /** The element bento #1 reserves space for; the page measures it and flies the hero into it. */
  slotRef: Ref<HTMLDivElement>
  /** The 3D hero. It lives *inside* bento #1's slot so, once docked, it scrolls with the grid natively. */
  hero: ReactNode
  onOpen: (item: BentoItem, el: HTMLElement) => void
  gridRef: Ref<HTMLDivElement>
}

export function BentoGrid({ rows, slotRef, hero, onOpen, gridRef }: Props) {
  return (
    <div className="pf-bento" ref={gridRef}>
      {rows.map((row, r) => (
        <div className="pf-bento__row" key={r} style={{ aspectRatio: row.aspect }}>
          {row.cells.map((cell, c) =>
            cell.item ? (
              <BentoCard key={cell.item.id} item={cell.item} weight={cell.weight} onOpen={onOpen} />
            ) : (
              // NOTE: no transform / filter / z-index / contain on this element or its ancestors —
              // any of them would turn it into the containing block of the hero's `position: fixed`.
              <div key={`hero-${c}`} className="pf-slot" data-cat="home" ref={slotRef} style={{ flexGrow: cell.weight }}>
                {hero}
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  )
}
