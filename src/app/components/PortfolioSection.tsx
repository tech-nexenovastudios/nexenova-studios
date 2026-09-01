import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Info } from 'lucide-react'
import gamesSeed from '../data/games.seed.json'
import { STAGE_BY_ID, STAGES, stageColor, stageOf, type Stage } from '../data/stages'
import { StoreBadges } from './StoreBadges'
import { StatusPill } from './GameStatusPill'

interface Game {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  status: string
  genre?: string
  fullDescription?: string
  platform: string[]
  steamUrl?: string
  playStoreUrl?: string
  appStoreUrl?: string
}

interface PortfolioSectionProps {
  onGameSelect?: (gameId: string) => void
}

/**
 * Filter chips. `in-development` folds the two earliest stages together —
 * a visitor only cares "can I play it yet", and nothing currently sits in
 * those two stages anyway — the chip hides itself when it matches nothing.
 */
type FilterId = 'all' | Stage | 'in-development'

const EARLY: Stage[] = ['prototype', 'ideation']

const FILTERS: Array<{ id: FilterId; label: string; stages: Stage[] }> = [
  { id: 'all', label: 'All games', stages: [] },
  { id: 'live', label: 'Live', stages: ['live'] },
  { id: 'soft-launch', label: 'Soft launch', stages: ['soft-launch'] },
  { id: 'coming-soon', label: 'Coming soon', stages: ['coming-soon'] },
  { id: 'in-development', label: 'In development', stages: EARLY },
]

export function PortfolioSection({ onGameSelect }: PortfolioSectionProps) {
  const [filter, setFilter] = useState<FilterId>('all')
  // One card's panel is open at a time, and this state is the ONLY thing that
  // opens it. Driving it from CSS :hover as well meant a tap on a touch device
  // could leave hover latched on, so the second tap flipped the state but the
  // panel stayed put — the toggle looked broken. Pointer, keyboard and tap all
  // go through here now.
  const [openId, setOpenId] = useState<string | null>(null)
  const canHover = useRef(false)
  useEffect(() => {
    canHover.current = window.matchMedia('(hover: hover)').matches
  }, [])

  const games = useMemo(
    () => (gamesSeed as Game[]).map(g => ({
      ...g,
      stage: stageOf(g),
      // Locally-authored key art; the rest still point at stock placeholders.
      hasArt: typeof g.image === 'string' && g.image.startsWith('/'),
    })),
    [],
  )

  const counts = useMemo(() => {
    const byStage = games.reduce<Record<string, number>>((acc, g) => {
      acc[g.stage] = (acc[g.stage] ?? 0) + 1
      return acc
    }, {})
    return FILTERS.reduce<Record<FilterId, number>>((acc, f) => {
      acc[f.id] =
        f.id === 'all'
          ? games.length
          : f.stages.reduce((n, s) => n + (byStage[s] ?? 0), 0)
      return acc
    }, {} as Record<FilterId, number>)
  }, [games])

  const visible = games.filter(g => {
    if (filter === 'all') return true
    const active = FILTERS.find(f => f.id === filter)
    return active ? active.stages.includes(g.stage) : false
  })

  // Titles with real key art lead, then maturity (live first). Art-first keeps
  // the finished cards above the fold instead of burying them behind concepts
  // that are still only a name.
  const liveCount = games.filter(g => g.stage === 'live').length
  const stageRank = new Map(STAGES.map((s, i) => [s.id, i]))
  const ordered = [...visible].sort((a, b) =>
    Number(b.hasArt) - Number(a.hasArt) ||
    (stageRank.get(b.stage)! - stageRank.get(a.stage)!) ||
    a.title.localeCompare(b.title),
  )

  // Touch: a tap toggles the panel (and a second tap closes it again).
  // Pointer: the panel is already open from hover, so a click there means
  // "take me to this game" rather than dismissing what the cursor is showing.
  const handleCardClick = (id: string) => {
    if (canHover.current) onGameSelect?.(id)
    else setOpenId(cur => (cur === id ? null : id))
  }
  const openOnPointer = (id: string) => { if (canHover.current) setOpenId(id) }
  const closeOnPointer = (id: string) => {
    if (canHover.current) setOpenId(cur => (cur === id ? null : cur))
  }

  return (
    <section id="portfolio" className="section-games py-24">
      <div className="container mx-auto px-4">

        <div className="mx-auto mb-10 max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="section-eyebrow mb-4 inline-block"
          >
            The Lineup
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-5 text-4xl font-extrabold tracking-tight md:text-5xl"
          >
            Games we&rsquo;ve shipped &mdash; and are about to.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-lg leading-relaxed text-muted-foreground"
          >
            {liveCount} live on Google Play, {games.length - liveCount} in production.
            Every card carries the stage it&rsquo;s actually at &mdash; no vapourware badges.
          </motion.p>
        </div>

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2.5" role="tablist" aria-label="Filter games by stage">
          {FILTERS.filter(f => counts[f.id] > 0).map(f => {
            const active = filter === f.id
            const dot = f.stages[0]
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: active ? 'var(--section-accent)' : 'var(--border)',
                  backgroundColor: active
                    ? 'color-mix(in oklab, var(--section-accent) 12%, transparent)'
                    : 'var(--surface-1)',
                  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
              >
                {dot && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: stageColor(dot) }}
                  />
                )}
                {f.label}
                <span className="font-mono text-xs text-muted-foreground">{counts[f.id]}</span>
              </button>
            )
          })}
        </div>

        {/* Portrait cards at the artwork's native 2:3. The card IS the image —
            every label sits on it, over a scrim, so there is no panel below. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {ordered.length === 0 ? (
            <p className="col-span-full py-12 text-center text-muted-foreground">
              Nothing at this stage yet.
            </p>
          ) : (
            ordered.map((game, i) => (
              <motion.article
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                viewport={{ once: true }}
                onClick={() => handleCardClick(game.id)}
                onMouseEnter={() => openOnPointer(game.id)}
                onMouseLeave={() => closeOnPointer(game.id)}
                // Tabbing into a store link should reveal the panel it lives in.
                onFocus={() => setOpenId(game.id)}
                onBlur={e => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOpenId(cur => (cur === game.id ? null : cur))
                  }
                }}
                data-open={openId === game.id}
                className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-2xl border border-border bg-[var(--surface-2)] transition-colors hover:border-[var(--section-accent)] focus-within:border-[var(--section-accent)] data-[open=true]:border-[var(--section-accent)]"
              >
                {game.hasArt ? (
                  <img
                    src={game.image}
                    alt={game.title}
                    width={800}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  // No key art yet. Rather than a stock photo standing in for a
                  // game that doesn't look like that, the card becomes a poster:
                  // brand ground, the studio mark watermarked, title, and an
                  // honest "in production" line.
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4 text-center"
                    style={{
                      background:
                        'radial-gradient(130% 95% at 50% 0%, color-mix(in oklab, var(--brand-purple) 30%, transparent), transparent 62%), radial-gradient(120% 90% at 50% 100%, color-mix(in oklab, var(--brand-cyan) 22%, transparent), transparent 62%), var(--surface-2)',
                    }}
                  >
                    <img
                      src="/logo-mark.png"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="pointer-events-none absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
                    />
                    <span
                      className="relative font-mono text-[0.65rem] uppercase tracking-[0.28em]"
                      style={{ color: stageColor(game.stage) }}
                    >
                      In production
                    </span>
                    <span className="relative mt-2 font-display text-lg font-extrabold leading-tight tracking-tight text-white">
                      {game.title}
                    </span>
                    <span className="relative mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
                      {game.genre}
                    </span>
                  </div>
                )}

                <div className="absolute left-3 top-3 z-10">
                  <StatusPill stage={game.stage} />
                </div>

                {/* Bottom scrim — dark enough under the text to clear AA, fading
                    to nothing so the artwork above it stays untouched. */}
                {game.hasArt && (
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-4 pt-14 transition-opacity duration-300 group-data-[open=true]:opacity-0">
                  <h3 className="font-display text-base font-extrabold leading-tight tracking-tight text-white sm:text-lg">
                    {game.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/70">
                    {game.description}
                  </p>
                  <span className="mt-2 flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-white/60">
                    {game.genre}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
                )}

                {/* Detail panel — slides up from the bottom edge on hover, on
                    keyboard focus, or on tap (data-open). */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex max-h-full translate-y-full flex-col gap-2.5 overflow-y-auto bg-black/92 p-3 backdrop-blur-sm group-data-[open=true]:pointer-events-auto transition-transform duration-300 ease-out group-data-[open=true]:translate-y-0 sm:gap-3 sm:p-4"
                >
                  <div>
                    <h3 className="font-display text-base font-extrabold leading-tight tracking-tight text-white">
                      {game.title}
                    </h3>
                    <span className="mt-0.5 block font-mono text-[0.7rem] uppercase tracking-[0.1em]" style={{ color: stageColor(game.stage) }}>
                      {STAGE_BY_ID[game.stage].short} &middot; {game.genre}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-white/75 sm:line-clamp-4">
                    {game.fullDescription || game.description}
                  </p>

                  <StoreBadges
                    playStoreUrl={game.playStoreUrl}
                    appStoreUrl={game.appStoreUrl}
                    title={game.title}
                  />

                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onGameSelect?.(game.id) }}
                    className="inline-flex min-h-9 items-center gap-1.5 text-[0.7rem] font-medium text-white/70 hover:text-white"
                  >
                    <Info className="h-3.5 w-3.5" />
                    Full details
                  </button>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
