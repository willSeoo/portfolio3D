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

// Small deterministic PRNG so the "random" layout is the same on every load/refresh
// (change SEED for a different arrangement).
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// [left, right] width weights — one box is a little wider than its neighbour.
const PAIRS: Array<[number, number]> = [
  [1.45, 1],
  [1, 1.45],
  [1.25, 1],
  [1, 1.25],
  [1.7, 1],
  [1, 1.7],
]
const PAIR_ASPECTS = [2.1, 2.35, 2.6, 2.9]
/** Every row is this fraction of its original height (so 0.74 = 26% shorter). */
const HEIGHT_FACTOR = 0.74

/**
 * Rows of 1 or 2 cells (never more than 2). The first row is always [hero, next] with the
 * hero the wider one, and the second row is a full-width box — that's the original design;
 * everything after that is shuffled with the seed.
 */
export function buildRows(items: BentoItem[], seed = 7): BentoRow[] {
  const rng = mulberry32(seed)
  const cells: Array<BentoItem | null> = [null, ...items]
  const rows: BentoRow[] = []
  let i = 0
  let lastPair = -1

  while (i < cells.length) {
    const remaining = cells.length - i
    const rowIndex = rows.length

    // the slim, tall box takes a narrow portrait slot beside a wide neighbour
    if (rowIndex >= 2 && remaining >= 2 && cells[i]?.shape === 'tall') {
      rows.push({
        aspect: 2.2,
        cells: [
          { item: cells[i], weight: 1 },
          { item: cells[i + 1], weight: 2.1 },
        ],
      })
      i += 2
      lastPair = -1
      continue
    }

    let pair: boolean
    if (rowIndex === 0) pair = remaining >= 2
    else if (rowIndex === 1) pair = false
    else pair = remaining >= 2 && rng() > 0.25

    if (pair) {
      let pick = Math.floor(rng() * PAIRS.length)
      if (pick === lastPair) pick = (pick + 1) % PAIRS.length
      lastPair = pick
      const [wl, wr] = rowIndex === 0 ? [1, 1] : PAIRS[pick]
      const aspect = (rowIndex === 0 ? 2.2 : PAIR_ASPECTS[Math.floor(rng() * PAIR_ASPECTS.length)]) / HEIGHT_FACTOR
      rows.push({
        aspect,
        cells: [
          { item: cells[i], weight: wl },
          { item: cells[i + 1], weight: wr },
        ],
      })
      i += 2
    } else {
      const wide = (2.9 + rng() * 0.6) / HEIGHT_FACTOR
      // the full-width box right under the hero row is the tall one (it holds a video)
      rows.push({ aspect: rowIndex === 1 ? 1.8 : wide, cells: [{ item: cells[i], weight: 1 }] })
      i += 1
    }
  }
  return rows
}
