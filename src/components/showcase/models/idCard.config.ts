/**
 * Everything printed on the ID card lives here — edit freely. The photo on the
 * front and the (optional) full-bleed photo on the back come from the slide's
 * entry in data.ts: `thumbnail` = front photo, `backImage` = back design.
 * Leave them out and you get a placeholder silhouette + a generated back.
 *
 * All of this is placeholder copy, written in the spirit of a cartoon
 * driver's license — swap in your real details, jokes, and colors.
 */
export interface IdCardConfig {
  state: string
  title: string
  classLabel: string
  number: string
  expires: string
  name: string
  addressLines: string[]
  details: { text: string; color?: string }[]
  signature: string
  backHeadline: string
  backLines: string[]
  backFooter: string
  palette: {
    paper: string
    stripe: string
    frame: string
    ink: string
    green: string
    red: string
    backFrom: string
    backTo: string
  }
}

export const idCardConfig: IdCardConfig = {
  state: 'PERBAUNGAN',
  title: 'DRIVER LICENSE',
  classLabel: 'CLASS: HCI',
  number: 'W1LL-2026-01',
  expires: 'EXPIRES: NEVER',
  name: 'WILLI',
  addressLines: ['PERBAUNGAN', 'NORTH SUMATRA, ID'],
  details: [
    { text: 'SKILLS: REACT · FIGMA · THREE.JS' },
    { text: 'HOBBY: GUITAR · COOKING · GAMES' },
    { text: 'BUGS: 0 (PROBABLY)', color: '#d13b3b' },
  ],
  signature: 'Willi',
  backHeadline: 'THIS LICENSE ENTITLES THE HOLDER TO:',
  backLines: ['DESIGN THINGS', 'BUILD THINGS', 'BREAK & FIX THINGS'],
  backFooter: 'IF FOUND, PLEASE RETURN TO THE NEAREST COFFEE SHOP',
  palette: {
    paper: '#f3eedf',
    stripe: '#e07a5f',
    frame: '#3d8a8f',
    ink: '#1c1c1c',
    green: '#2f7d4f',
    red: '#d13b3b',
    backFrom: '#e07a5f',
    backTo: '#f2cc8f',
  },
}
