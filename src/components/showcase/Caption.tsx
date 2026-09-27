import type { ShowcaseItem } from './types'

export function Caption({ item }: { item: ShowcaseItem }) {
  return (
    <div className="sc-caption">
      <div className="sc-caption__text">
        <h2>{item.title}</h2>
        <p>
          {item.category} · {item.year}
        </p>
      </div>
    </div>
  )
}
