import { STAGE_BY_ID, stageColor, type Stage } from '../data/stages'

/** Tinted surface derived from a stage colour, so pills never hardcode a hue. */
const tint = (stage: Stage, pct: number) =>
  `color-mix(in oklab, ${stageColor(stage)} ${pct}%, transparent)`

export function StatusPill({ stage, label }: { stage: Stage; label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] backdrop-blur-sm"
      style={{
        color: stageColor(stage),
        backgroundColor: 'color-mix(in oklab, var(--background) 82%, transparent)',
        borderColor: tint(stage, 35),
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: stageColor(stage) }}
      />
      {label ?? STAGE_BY_ID[stage].short}
    </span>
  )
}
