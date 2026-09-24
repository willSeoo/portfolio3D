# Project Cards

```
npm install
npm run dev
```

`npm install` may print ERESOLVE warnings (React 19.3 vs a peer range of
`>=19 <19.3` from `@react-three/fiber`) — those are warnings, not failures;
the committed `package-lock.json` already resolves a working tree.

## What's here

- **`src/components/project-card-3d/`** — the real WebGL version (default,
  wired into `src/App.tsx`). Real `BoxGeometry` per card (actual thickness,
  actual rounded-corner alpha-clipped texture, actual edges), `three.js` +
  `@react-three/fiber`, PBR materials (`MeshPhysicalMaterial` with clearcoat)
  lit by a procedural studio environment (`RoomEnvironment`, generated
  on-device — no HDRI file fetch) so the "shine" is real specular light, not
  a CSS gradient trick. Each card spins continuously on a tilted axis,
  pauses and turns upright on hover, flips on click, and the back's
  "View Case Study →" area navigates via a UV hit-test against the baked
  back-face texture.
  - `ProjectCardScene` — drop this in: `<ProjectCardScene />`
  - `Marquee3D` — the looping row (sizing, spin, pause coordination)
  - `Card3D` — one card: geometry, materials, spin/tilt/flip/click
  - `useCardFaces` — bakes each project's front/back into a `CanvasTexture`
    (this is also where the CTA hit-rect is computed)
- **`src/components/project-card/`** — the earlier CSS 3D-transform version
  (flip cards, no WebGL). Still here, not wired up, in case you want it back
  — swap the import in `src/App.tsx`.
- **`src/data/projects.ts`** — shared by both versions. Swap the placeholder
  `.svg`s in `public/assets/projects/` for real screenshots.

## Tuning the 3D version

`<ProjectCardScene speed={0.55} spinRpm={2.6} heightFraction={0.7} background="#f4f2ee" />`

- `speed` — world units/sec the row drifts right to left
- `spinRpm` — full turns per minute for each card's own spin
- `heightFraction` — card height as a fraction of the canvas's visible height
  (width follows from the card's own aspect ratio)

## Known limits

- Bundle is ~1.1MB gzip ~310KB (three.js + fiber + drei) — fine for a portfolio,
  but consider lazy-loading the scene component if that matters to you.
- No test was done on an actual GPU/Safari — only headless Chromium with
  software rendering. Real hardware should look at least as good, but worth
  a quick check on your own devices before shipping.
