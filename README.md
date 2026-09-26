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
(card / phone / old CRT PC) or a third-party embed — with arrow buttons and
the ← → keys to switch, a satisfying slide/scale/fade transition with a
synthesized sound blip (Web Audio, no audio files), and grab-to-spin on
every 3D model. Clicking a model (a real click, not a drag) or the "View
case study" pill opens a popup: **✕ closes it, ○ opens the project's page**.

`src/components/showcase/` is the whole thing:

- **`ShowcaseScene.tsx`** — the page: stage, transition, arrows, caption,
  popup, keyboard. This is what's wired into `App.tsx`.
- **`data.ts`** — **your project list.** Each entry is one of:
  - `{ kind: 'model', model: 'card' | 'phone' | 'oldpc', thumbnail, tone, href, ... }`
  - `{ kind: 'embed', embedUrl, embedTitle, embedAuthor, embedAuthorUrl, sourceUrl, href, ... }`
    — paste any Sketchfab embed URL + its attribution fields here (I used
    your cat model as the 4th slide, pointed at `/cats`).
  Add, remove, or reorder items freely; the carousel just follows the array.
- **`models/CardModel.tsx`**, **`models/PhoneModel.tsx`**,
  **`models/OldPCModel.tsx`** — one file per 3D model type, so you can
  restyle any of them without touching the others. Each takes `item` (for
  the thumbnail/tone/title) and `size`. `models/ModelStage.tsx` is what
  picks the right one and sets its size.
- **`models/useScreenTexture.ts`** — loads `item.thumbnail` onto whichever
  plane is the "screen" (the phone's face, the CRT's tube, the card's back
  art). No thumbnail, or the image 404s → a generated placeholder, so
  nothing breaks while you're filling these in.
- **`SketchfabEmbed.tsx`** — a straight JSX port of Sketchfab's own embed
  snippet. **Heads-up:** it's a cross-origin iframe, so our page can't see
  clicks that land inside it — that's the browser, not a bug — which is
  why every slide (embeds included) also has the "View case study" pill.
- **`sound.ts`** — the four sound effects, all synthesized oscillator
  blips. Tweak frequencies/durations here.
- **`useCarousel.ts`** — index + the leave/enter transition timing
  (`LEAVE_MS`/`ENTER_MS`).

## Adding a new 3D model type of your own

1. Drop the `.glb`/`.gltf` wherever you like under `public/` (or wire up a
   loader for whatever format you're using — `three/examples/jsm/loaders/GLTFLoader.js`
   ships with the `three` package already installed here).
2. New file in `models/`, same shape as the existing ones: take `item` and
   `size`, return a `<group>` with your mesh(es) inside.
3. Add your type to `ModelType` in `types.ts`, a case in
   `models/ModelStage.tsx`, and a height fraction in its `HEIGHT_FRACTION`
   table.
4. Reference it from `data.ts` with `model: 'yourType'`.

## Known limits

- Sandbox testing here couldn't actually load `sketchfab.com` (network
  egress is locked down in this environment) — the embed showed a blocked-host
  message in my screenshots. The markup is a faithful port of what you
  pasted, so it should load fine in your real browser; worth a quick check
  once you open it live.
- No test on real hardware/Safari — headless Chromium with software WebGL
  only. Should look at least as good on a real GPU.
- Bundle is ~1.1MB (~310KB gzip) from three.js + fiber. Fine for a
  portfolio; lazy-load `ShowcaseScene` if that ever matters.
