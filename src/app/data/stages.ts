/**
 * Studio Black — the maturity ramp.
 *
 * A game's stage is the single source of truth for how it is coloured and
 * labelled everywhere on the site: the games grid and the hero's
 * distribution bar. Colour is never chosen per component — it always
 * resolves to one of the five CSS variables defined in globals.css, which are
 * a single oklch family (identical lightness and chroma, hue only varies).
 *
 * Order matters: STAGES is listed earliest-to-latest and drives sort order,
 * the filter chips and the hero bar.
 */

export type Stage =
  | 'ideation'
  | 'prototype'
  | 'soft-launch'
  | 'coming-soon'
  | 'live'

export interface StageMeta {
  id: Stage
  /** Long label. */
  label: string
  /** Short label used on status pills and filter chips. */
  short: string
  blurb: string
  /** CSS variable holding this stage's colour. */
  varName: string
}

export const STAGES: StageMeta[] = [
  {
    id: 'ideation',
    label: 'Ideation',
    short: 'Ideation',
    blurb: 'Sketches and core-loop pitches. Most won’t make it.',
    varName: '--stage-ideation',
  },
  {
    id: 'prototype',
    label: 'In Prototype',
    short: 'Prototype',
    blurb: 'Playable builds with one mechanic. Hunting the hook.',
    varName: '--stage-prototype',
  },
  {
    id: 'soft-launch',
    label: 'Soft-Launch Prep',
    short: 'Soft launch',
    blurb: 'The candidate. Levels, juice, monetization being tuned.',
    varName: '--stage-softlaunch',
  },
  {
    id: 'coming-soon',
    label: 'Coming Soon',
    short: 'Coming soon',
    blurb: 'Heading to stores. The survivors of the gauntlet.',
    varName: '--stage-soon',
  },
  {
    id: 'live',
    label: 'Live',
    short: 'Live',
    blurb: 'Shipped and playable right now.',
    varName: '--stage-live',
  },
]

export const STAGE_BY_ID: Record<Stage, StageMeta> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<Stage, StageMeta>,
)

/** `var(--stage-…)` for a stage — pass straight to a style prop. */
export const stageColor = (stage: Stage) => `var(${STAGE_BY_ID[stage].varName})`

/**
 * Unreleased titles and where they sit. Shipped games are resolved from their
 * `status` by stageOf() and never appear here; anything absent falls back to
 * 'coming-soon'.
 */
export const STAGE_MAP: Record<string, Stage> = {
  'bird-hunter': 'coming-soon',
  'tiny-vanguard': 'coming-soon',
  'tower-defence-system': 'coming-soon',
}

/**
 * A game's stage. A shipped `status` always wins over the backlog map — the
 * map describes what is being built, the status describes what is out.
 */
export function stageOf(game: { id: string; status?: string }): Stage {
  if (game.status === 'Released' || game.status === 'Published') return 'live'
  return STAGE_MAP[game.id] ?? 'coming-soon'
}
