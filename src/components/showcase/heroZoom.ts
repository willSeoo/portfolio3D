/**
 * Shared between PortfolioPage (writes) and the 3D scene (reads every frame / on tap).
 *  - value:  1 = the fullscreen hero. Eased up while the hero docks into its (smaller) bento
 *            card so the 3D object keeps reading as the subject of the card.
 *  - docked: true once the hero is (nearly) inside bento #1 — a tap on it then means "go home".
 */
/** dock: 0 = fullscreen hero … 1 = fully inside its bento card — each model picks its own size for that (see ModelStage). */
export const heroZoom = { value: 1, docked: false, dock: 0 }
