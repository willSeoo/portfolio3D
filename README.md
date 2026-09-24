# Spin Card

```
npm install
npm run dev
```

`npm install` may print ERESOLVE warnings (React 19.3 vs a peer range of
`>=19 <19.3` from `@react-three/fiber`) — warnings, not failures; the
committed `package-lock.json` already resolves a working tree.

## What's here

One real WebGL card (`three.js` + `@react-three/fiber`), centered on the
page, that you grab and spin freely with mouse or touch — it never moves
from its spot, only rotates. Release and it coasts to a stop instead of
stopping dead.

- **`src/components/spin-card/SpinCardScene.tsx`** — the whole page: Canvas,
  lighting, a procedural studio environment for real reflections (no HDRI
  fetch), sizes the card to the viewport.
- **`SpinCard.tsx`** — the card mesh: real `BoxGeometry` (actual thickness),
  `MeshPhysicalMaterial` with clearcoat for the shine, drag wired up.
- **`useDragRotate.ts`** — the interaction: pointer-drag rotates on world
  X/Y freely (not locked to one axis), with inertia on release.
- **`buildFaces.ts`** — draws the two faces onto a canvas, baked into a
  texture. Front is a generic bank-card layout (chip, number, name, expiry,
  an abstract two-circle mark — deliberately not a real card network's
  logo). Back is free-form abstract art. Edit this file to change either
  face — it's plain 2D canvas drawing, no image assets needed.

Old multi-card versions (`project-card/` — CSS flip cards, and
`project-card-3d/` — the looping WebGL marquee) are still in the repo,
just not wired into `App.tsx`, in case you want to go back to either.
