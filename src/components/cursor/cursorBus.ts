/**
 * The 3D models are the one thing on the page that keeps the *system* cursor (grab / grabbing),
 * so people can tell they can be dragged. The model code reports hover/drag here and the custom
 * cursor steps aside (see cursor.css for the matching `cursor: grab` rules).
 */
export const MODEL_CURSOR_EVENT = 'model-cursor'

let clearTimer = 0

export function setModelCursor(state: 'grab' | 'grabbing' | null) {
  const root = document.documentElement
  window.clearTimeout(clearTimer)
  const apply = () => {
    if (state) root.dataset.model = state
    else delete root.dataset.model
    window.dispatchEvent(new Event(MODEL_CURSOR_EVENT))
  }
  // moving between the model's child meshes fires out→over back to back: don't flicker on that
  if (state === null) clearTimer = window.setTimeout(apply, 60)
  else apply()
}
