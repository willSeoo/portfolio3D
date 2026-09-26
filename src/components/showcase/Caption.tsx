import type { ShowcaseItem } from './types'

interface Props {
  item: ShowcaseItem
  onView: () => void
}

export function Caption({ item, onView }: Props) {
  return (
    <div className="sc-caption">
      <div className="sc-caption__text">
        <h2>{item.title}</h2>
        <p>
          {item.category} · {item.year}
        </p>
      </div>
      <button type="button" className="sc-caption__cta" onClick={onView}>
        View case study →
      </button>
    </div>
  )
}
