import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { BentoCard } from './BentoCard'
import { Lightbox } from './Lightbox'
import { bentoItems } from './data'
import type { BentoItem } from './types'
import './bento.css'

interface Props {
  /** Ref for Bento Box #1's real DOM node — the hero-to-bento scroll transition animates toward this. */
  firstCardRef?: RefObject<HTMLButtonElement | null>
}

// Group items into rows: two 'half' items share a row (max 2, per spec), a
// 'full' item takes its own row, and an unpaired trailing half just takes the
// row by itself too.
function groupRows(items: BentoItem[]): BentoItem[][] {
  const rows: BentoItem[][] = []
  let i = 0
  while (i < items.length) {
    const item = items[i]
    if (item.span === 'full') {
      rows.push([item])
      i += 1
      continue
    }
    const next = items[i + 1]
    if (next && next.span === 'half') {
      rows.push([item, next])
      i += 2
    } else {
      rows.push([item])
      i += 1
    }
  }
  return rows
}

export function BentoGrid({ firstCardRef }: Props) {
  const [openItem, setOpenItem] = useState<BentoItem | null>(null)
  const localFirstRef = useRef<HTMLButtonElement>(null)
  const rows = groupRows(bentoItems)

  return (
    <section id="work" className="bento-section">
      <div className="bento-section__head">
        <p className="bento-eyebrow">Selected work</p>
        <h2>Work, fun &amp; a little philosophy</h2>
      </div>

      <div className="bento-grid">
        {rows.map((row, rowIndex) => (
          <div className="bento-row" key={row.map((it) => it.id).join('-')}>
            {row.map((item, colIndex) => {
              const isFirstCard = rowIndex === 0 && colIndex === 0
              const ratio = row.length === 2 ? item.widthRatio ?? 0.5 : 1
              return (
                <BentoCard
                  key={item.id}
                  item={item}
                  onOpen={setOpenItem}
                  targetRef={isFirstCard ? firstCardRef ?? localFirstRef : undefined}
                  style={row.length === 2 ? { flex: `${ratio} ${ratio} 0%` } : undefined}
                />
              )
            })}
          </div>
        ))}
      </div>

      {openItem && <Lightbox item={openItem} onClose={() => setOpenItem(null)} />}
    </section>
  )
}
