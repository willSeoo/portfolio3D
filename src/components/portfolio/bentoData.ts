/** The 3D models in the hero are categories (card → about, phone → uiux, old PC → engineering, swatch fan → graphic); motion has no model (yet). */
export type BentoCategory = 'about' | 'motion' | 'uiux' | 'graphic' | 'engineering'

export interface BentoItem {
  id: string
  category: BentoCategory
  title: string
  year: string
  /** Text shown under the expanded view. */
  blurb: string
  kind: 'image' | 'video' | 'experience' | 'globe'
  /** 'tall' = the slim, tall box: it gets a narrow, portrait slot next to a wide neighbour. */
  shape?: 'tall'
  /** Black & white footage (the 'activity loop' look). */
  mono?: boolean
  /** Status text laid over the media (top: status + live dot, bottom: period). */
  overlay?: { status: string; period?: string }
  /** Image URL, or the video file URL when kind === 'video'. */
  src: string
  /** Video only: still frame shown before it loads. */
  poster?: string
  /** Optional: where the ↗ arrow in the expanded view goes (case study, repo, …). */
  href?: string
  /** kind === 'experience': the scrollable list shown right inside the card (no lightbox). */
  heading?: string
  entries?: ExperienceEntry[]
}

export interface ExperienceEntry {
  from: string
  to: string
  title: string
  text: string
}

export const CATEGORY_LABEL: Record<BentoCategory, string> = {
  about: 'About',
  motion: 'Motion',
  uiux: 'UI/UX Design',
  graphic: 'Graphic Design',
  engineering: 'Software Engineering',
}

// Bento #1 is always the 3D hero (the carousel) — these are bento #2 onwards.
// The ORDER of bento boxes on the page is set in layout.ts (LAYOUT) by id: 1 hero · 2–4 About · 5–7 Motion ·
// 8–9 UI/UX · 10–11 Graphic · 12–13 Engineering. Add an item here and it lands after those automatically.
// Swap `src` for your own files any time: drop them in /public/assets/ and use '/assets/xxx.jpg',
// or paste any URL. The picsum.photos images are placeholders. Add or remove items freely —
// the grid re-flows itself.
export const bentoItems: BentoItem[] = [
  {
    id: 'experience',
    category: 'about',
    title: 'Experience',
    year: '',
    blurb: '',
    kind: 'experience',
    src: '',
    heading: 'Work',
    // PLACEHOLDER content — replace with your own history (add or remove entries freely, the card scrolls).
    entries: [
      { from: '2025', to: 'Now', title: 'Company Name', text: 'Frontend Developer. Building interactive, 3D-driven web experiences with React and Three.js.' },
      { from: '2023', to: '2025', title: 'Studio Name', text: 'UI/UX Designer. Took product interfaces from first sketch to shipped, polished screens.' },
      { from: '2022', to: '2023', title: 'Agency Name', text: 'Web Developer. Landing pages, design systems and motion for client brands.' },
      { from: '2021', to: '2022', title: 'Freelance', text: 'Designer & developer. Branding, websites and small apps for local businesses.' },
      { from: '2020', to: '2021', title: 'Company Name', text: 'Junior Developer. First production code, first real deadlines, a lot of learning.' },
    ],
  },
  {
    // The slim, tall box: a looping, black & white montage of what I'm up to (walks, rides, …).
    // PLACEHOLDER clip — swap `src` for your own montage (portrait works best).
    id: 'activity-loop',
    category: 'about',
    title: 'Out and about',
    year: '2026',
    blurb: 'A loop of small moments — walks, rides, whatever the week held.',
    kind: 'video',
    shape: 'tall',
    mono: true,
    overlay: { status: 'Online' },
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://picsum.photos/seed/out-and-about/900/1200?grayscale',
  },
  {
    // Interactive 3D globe: drag to spin, tap to open bigger. Shows region + live local time.
    id: 'where-i-am',
    category: 'about',
    title: 'Where I’m based',
    year: '2026',
    blurb: 'Medan, North Sumatra, Indonesia — WIB (UTC+7).',
    kind: 'globe',
    src: '',
  },
  {
    // PLACEHOLDER motion graphic (Mixkit free stock video, https://mixkit.co/license/#videoFree) — swap `src`/`poster` for your own work.
    id: 'motion-1',
    category: 'motion',
    title: 'Emerald light study',
    year: '2026',
    blurb: 'Fluid shapes and glimmers of green light — a study in how little it takes to make something feel alive.',
    kind: 'video',
    src: 'https://assets.mixkit.co/00imk431h0vo31kty0a05gilqb1h',
    poster: 'https://assets.mixkit.co/voahzzgqjhln6fxuli1jucwdzv0u',
  },
  {
    // PLACEHOLDER motion graphic (Mixkit free stock video, https://mixkit.co/license/#videoFree) — swap `src`/`poster` for your own work.
    id: 'motion-2',
    category: 'motion',
    title: 'Violet glow',
    year: '2026',
    blurb: 'Soft purple light forming shapes in the dark. A loop built for a title sequence.',
    kind: 'video',
    src: 'https://assets.mixkit.co/8llsbe99s3d3yrfx6mkw3dreeuh6',
    poster: 'https://assets.mixkit.co/olsekdc3r4m8dhle603agyuq8sxg',
  },
  {
    // PLACEHOLDER motion graphic (Mixkit free stock video, https://mixkit.co/license/#videoFree) — swap `src`/`poster` for your own work.
    id: 'motion-3',
    category: 'motion',
    title: 'Orange glow',
    year: '2026',
    blurb: 'A bright light cutting through soft smoke. Colour and timing exercise.',
    kind: 'video',
    src: 'https://assets.mixkit.co/plgpzwflrz2hgmuzdajxb82ewzbm',
    poster: 'https://assets.mixkit.co/c5yiaojpyzfw45ap39d0x85w6x53',
  },
  {
    id: 'comick',
    category: 'uiux',
    title: 'ComicK redesign',
    year: '2026',
    blurb: 'A calmer reading experience for a manga tracker: fewer chrome, bigger covers, one-handed navigation.',
    kind: 'image',
    src: 'https://picsum.photos/seed/comick-redesign/1400/1100',
    href: '/projects/comick',
  },
  {
    id: 'ledger',
    category: 'uiux',
    title: 'Ledger — finance agent UI',
    year: '2026',
    blurb:
      'Interface for an AI bookkeeping agent: it asks clarifying questions, drafts a plan, and waits for approval before touching a single entry.',
    kind: 'image',
    src: 'https://picsum.photos/seed/ledger-ui/1600/1000',
    href: '/projects/ledger',
  },
  {
    id: 'brutalist-type',
    category: 'graphic',
    title: 'Make it slowly',
    year: '2026',
    blurb:
      'Notes on craft: why the third pass over a detail is usually where a thing starts to feel inevitable instead of merely finished.',
    kind: 'image',
    src: 'https://picsum.photos/seed/slow-craft/1800/900',
  },
  {
    id: 'less-but-better',
    category: 'graphic',
    title: 'Less, but better',
    year: '2025',
    blurb: 'What I cut from every project before shipping it, and what that says about what I think the project is for.',
    kind: 'image',
    src: 'https://picsum.photos/seed/less-better/1400/1000',
  },
  {
    id: 'reel-weird',
    category: 'engineering',
    title: 'Reel Weird',
    year: '2026',
    blurb: 'A small fishing game that is a little too strange to be relaxing. Built for a game jam, kept for the vibes.',
    kind: 'image',
    src: 'https://picsum.photos/seed/reel-weird-cover/1500/1000',
    href: '/projects/reel-weird',
  },
  {
    id: 'terminal-tool',
    category: 'engineering',
    title: 'Small tools',
    year: '2026',
    blurb: 'A drawer of small command-line tools and scripts that make everyday work a little quieter.',
    kind: 'image',
    src: 'https://picsum.photos/seed/small-tools/1500/1000',
  },
]
