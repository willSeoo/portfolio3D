# Showcase Carousel

```
npm install
npm run dev
```

`npm install` may print ERESOLVE warnings (React 19.3 vs a peer range of
`>=19 <19.3` from `@react-three/fiber`) — warnings, not failures; the
committed `package-lock.json` already resolves a working tree.

## What's here

One centered "stage" that shows a project at a time — a real WebGL model
(card / phone / old CRT PC) or a plain photo — with arrow buttons and the
← → keys to switch, a snappy slide/scale/rotate transition with a short
synthesized click (Web Audio, no audio files), and grab-to-spin on every
3D model (cursor turns to a hand on hover). Left alone for a moment, a
model slowly turns on its own — grabbing it interrupts that instantly.
**Click** a model (a real click, not a drag) to open a popup:
**✕ closes it, ○ opens the project's page.**

The Canvas (WebGL context) stays mounted across every slide, model or not —
only the model *inside* it swaps — so the camera/viewport never has to
re-measure itself mid-carousel, which is what caused the old "drifts left
after wrapping around" bug.

`src/components/showcase/` is the whole thing:

- **`Navbar.tsx`** — top bar (logo, Home/Work/Fun/Philosophy, Blog + Contact
  pills). Labels, hrefs and the star logo are placeholders — edit the file
  directly. Spacing follows the reference's proportions (`padding: 0 7.5vw`).
- **`Caption.tsx`** — the big light-gray wordmark bottom-left; it shows the
  current project's title (font size / color / left margin in `showcase.css`
  under `.sc-caption`).
- **`ShowcaseScene.tsx`** — the page: stage, transition, arrows, caption,
  popup, keyboard. Wired into `App.tsx`.
- **`data.ts`** — **your project list.** Each entry is one of:
  - `{ kind: 'model', model: 'card' | 'phone' | 'oldpc', thumbnail, tone, href, ... }`
  - `{ kind: 'photo', src, href, ... }` — a plain photo, same box size/style
    the old Sketchfab embed used.
  - `{ kind: 'embed', embedUrl, embedTitle, embedAuthor, embedAuthorUrl, sourceUrl, href, ... }`
    — still supported if you want a Sketchfab model again later; it gets a
    small ○ button in its corner since we can't detect clicks inside a
    cross-origin iframe.
  Add, remove, or reorder items freely; the carousel just follows the array.
- **`models/CardModel.tsx`**, **`models/PhoneModel.tsx`**,
  **`models/OldPCModel.tsx`** — one file per 3D model type. Each takes
  `item` (thumbnail/tone/title) and `size`. `models/ModelStage.tsx` picks
  the right one, sizes it (`HEIGHT_FRACTION` per type), and wires up
  grab/click/hover.
- **`models/useGrabRotate.ts`** — drag-to-spin, inertia on release, and the
  slow idle turn once it's settled (`IDLE_SPEED`, `IDLE_DELAY`).
- **`models/useScreenTexture.ts`** — loads `item.thumbnail` onto whichever
  plane is the "screen". Right now phone/PC/photo point at
  [picsum.photos](https://picsum.photos) placeholder images (free, no
  attribution needed) — swap `thumbnail`/`src` in `data.ts` for your own
  images any time. If an image 404s, it falls back to a generated
  placeholder, so nothing breaks while you're filling these in.
- **`PhotoShowcase.tsx`** — the `photo` kind's renderer.
- **`SketchfabEmbed.tsx`** — a straight JSX port of Sketchfab's own embed
  snippet, for the `embed` kind.
- **`sound.ts`** — the four sound effects: each is a short filtered-noise
  "thock" layered under a square-wave blip. Tweak `freq`/`gain`/`duration`
  here for a softer or harder hit.
- **`useCarousel.ts`** — index + the leave/enter transition timing
  (`LEAVE_MS`/`ENTER_MS`).

## Adding a new 3D model type of your own

1. Drop the `.glb`/`.gltf` wherever you like under `public/` (or wire up a
   loader — `three/examples/jsm/loaders/GLTFLoader.js` ships with the
   `three` package already installed here).
2. New file in `models/`, same shape as the existing ones: take `item` and
   `size`, return a `<group>` with your mesh(es) inside.
3. Add your type to `ModelType` in `types.ts`, a case in
   `models/ModelStage.tsx`, and a height fraction in its `HEIGHT_FRACTION`
   table.
4. Reference it from `data.ts` with `model: 'yourType'`.

## Known limits

- This sandbox's network couldn't reach `sketchfab.com` or `picsum.photos`
  to test loading — my screenshots showed a blocked-host message and
  broken-image icons respectively. Both are just this environment; neither
  should be a problem in your actual browser, but it's worth a quick look
  once you open it live, especially the picsum placeholders.
- No test on real hardware/Safari — headless Chromium with software WebGL
  only. Should look at least as good on a real GPU.
- Bundle is ~1.1MB (~312KB gzip) from three.js + fiber. Fine for a
  portfolio; lazy-load `ShowcaseScene` if that ever matters.
