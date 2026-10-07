import type { BentoItem } from './bentoData'

export interface BentoCell {
  /** `null` = the 3D hero (always bento #1). */
  item: BentoItem | null
  /** Relative width inside its row (flex-grow). */
  weight: number
}
export interface BentoRow {
  /** width / height of the whole row. */
  aspect: number
  cells: BentoCell[]
}

/**
 * The page, in order, row by row. Each cell is [id, width weight]; `'hero'` is bento #1 (the 3D hero).
 * Rows hold 1 or 2 boxes, never more. Bento numbers count left → right, top → bottom:
 *
 *   1  hero       2  experience                     ← About (2–4)
 *   3  loop       4  globe
 *   5  motion (full width)                          ← Motion (5–7)
 *   6  motion     7  motion
 *   8  ui/ux      9  ui/ux                          ← UI/UX (8–9)
 *   10 graphic    11 graphic                        ← Graphic (10–11)
 *   12 software   13 software                       ← Engineering (12–13)
 *
 * Aspect = row width / row height (smaller = taller). Weights make one box a little wider than
 * its neighbour. Items that aren't listed here are appended afterwards, two per row.
 */
const LAYOUT: Array<{ aspect: number; cells: Array<[string, number]> }> = [
  { aspect: 2.97, cells: [['hero', 1], ['experience', 1]] },
  { aspect: 2.45, cells: [['activity-loop', 1], ['where-i-am', 2.1]] },
  { aspect: 1.9, cells: [['motion-1', 1]] },
  { aspect: 2.9, cells: [['motion-2', 1.5], ['motion-3', 1]] },
  { aspect: 2.9, cells: [['comick', 1], ['ledger', 1.5]] },
  { aspect: 2.9, cells: [['brutalist-type', 1.5], ['less-but-better', 1]] },
  { aspect: 2.9, cells: [['reel-weird', 1], ['terminal-tool', 1.5]] },
]

export function buildRows(items: BentoItem[]): BentoRow[] {
  const byId = new Map(items.map((i) => [i.id, i]))
  const used = new Set<string>()
  const rows: BentoRow[] = []

  for (const spec of LAYOUT) {
    const cells: BentoCell[] = []
    for (const [id, weight] of spec.cells) {
      if (id === 'hero') cells.push({ item: null, weight })
      else {
        const item = byId.get(id)
        if (item) {
          cells.push({ item, weight })
          used.add(id)
        }
      }
    }
    if (cells.length) rows.push({ aspect: spec.aspect, cells })
  }

  // anything new that isn't placed above: two per row, alternating which one is wider
  const rest = items.filter((i) => !used.has(i.id))
  for (let i = 0, r = 0; i < rest.length; i += 2, r++) {
    const pair = rest.slice(i, i + 2)
    const flip = r % 2 === 0
    rows.push({
      aspect: pair.length === 2 ? 2.9 : 2.6,
      cells: pair.map((item, k) => ({ item, weight: pair.length === 2 ? (k === 0) === flip ? 1.4 : 1 : 1 })),
    })
  }
  return rows
}
