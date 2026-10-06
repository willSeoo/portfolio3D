import { useEffect, useState } from 'react'
import { HOME_PLACE } from './GlobeCanvas'

function useLocalTime() {
  const make = () => {
    const now = new Date()
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: HOME_PLACE.timeZone }).format(now)
    const date = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: HOME_PLACE.timeZone }).format(now)
    return { time, date }
  }
  const [v, setV] = useState(make)
  useEffect(() => {
    const id = window.setInterval(() => setV((p) => {
      const n = make()
      return n.time === p.time && n.date === p.date ? p : n
    }), 1000)
    return () => window.clearInterval(id)
  }, [])
  return v
}

/** Text laid over the globe: where I am + my local time (live). */
export function GlobeInfo() {
  const { time, date } = useLocalTime()
  return (
    <div className="pf-globe__info" aria-hidden="false">
      <div className="pf-globe__where">
        <span className="pf-globe__eyebrow">Based in</span>
        <strong>{HOME_PLACE.name}</strong>
        <span>{HOME_PLACE.region}</span>
      </div>
      <div className="pf-globe__time">
        <time>{time}</time>
        <span>
          {HOME_PLACE.tzLabel} · {date}
        </span>
      </div>
    </div>
  )
}
