import { useState } from 'react'
import { motion } from 'motion/react'
import { Lightbulb, Hammer, Rocket, Sparkles, ArrowRight, Skull } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { AnimatedSection } from './AnimatedSection'
import gamesSeed from '../data/games.seed.json'

type Stage = 'ideation' | 'prototype' | 'soft-launch' | 'coming-soon'

interface SeedGame {
  id: string
  title: string
  description: string
  tagline?: string
  genre: string
  tags: string[]
  status: string
}

interface ServicesSectionProps {
  onGameSelect?: (gameId: string) => void
}

// Where each concept sits in the pipeline. Mirrors the Game Ideas PDF backlog.
const STAGE_MAP: Record<string, Stage> = {
  'bird-hunter': 'coming-soon',
  'endless-merge-2048': 'soft-launch',
  'sweet-tumble': 'soft-launch',
  'twisty-snake': 'soft-launch',
  'last-turn': 'prototype',
  'smashy-qube': 'soft-launch',
  '2048-striker': 'prototype',
  'phase-shift-runner': 'prototype',
  'echo-loop': 'prototype',
  'flip-trace': 'prototype',
  'momentum-painter': 'prototype',
  'chain-architect': 'ideation',
  'pressure-grid': 'ideation',
  'split-control': 'ideation',
  'reality-fold': 'ideation',
  'signal-sync': 'ideation',
}

const LANES: Array<{
  id: Stage
  label: string
  blurb: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}> = [
  {
    id: 'ideation',
    label: 'Ideation',
    blurb: 'Sketches and core-loop pitches. Most won’t make it.',
    icon: Lightbulb,
    accent: 'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'prototype',
    label: 'In Prototype',
    blurb: 'Playable builds with one mechanic. Hunting the hook.',
    icon: Hammer,
    accent: 'from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'soft-launch',
    label: 'Soft-Launch Prep',
    blurb: 'The candidate. Levels, juice, monetization being tuned.',
    icon: Sparkles,
    accent: 'from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-400',
  },
  {
    id: 'coming-soon',
    label: 'Coming Soon',
    blurb: 'Heading to stores. The survivors of the gauntlet.',
    icon: Rocket,
    accent: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
  },
]

export function ServicesSection({ onGameSelect }: ServicesSectionProps) {
  const games = gamesSeed as SeedGame[]
  const groupedByStage: Record<Stage, SeedGame[]> = {
    ideation: [],
    prototype: [],
    'soft-launch': [],
    'coming-soon': [],
  }
  for (const g of games) {
    const stage = STAGE_MAP[g.id]
    if (stage) groupedByStage[stage].push(g)
  }

  // Mobile shows one stage at a time via a tab strip (the 4-column board
  // doesn't translate to a tall vertical stack on small screens).
  const [activeStage, setActiveStage] = useState<Stage>('ideation')

  const renderCard = (g: SeedGame) => (
    <motion.button
      key={g.id}
      type="button"
      onClick={() => onGameSelect?.(g.id)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl"
    >
      <Card className="border-border/50 hover:border-primary/40 hover:shadow-sm transition-all bg-background/60 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight flex-1">{g.title}</h3>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0 mt-0.5" />
        </div>
        {g.tagline && (
          <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-2">{g.tagline}</p>
        )}
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium">
          {g.genre}
        </Badge>
      </Card>
    </motion.button>
  )

  const emptyState = (
    <div className="text-center py-8 text-sm text-muted-foreground italic">
      <Skull className="h-4 w-4 mx-auto mb-2 opacity-50" />
      Nothing here yet.
    </div>
  )

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block text-xs uppercase tracking-[0.22em] text-primary font-medium mb-4"
          >
            The Pipeline
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-5 tracking-tight"
          >
            What we&rsquo;re building.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Twelve concepts in flight. One will earn the launch. The rest get killed without ceremony &mdash; that&rsquo;s how we keep the survivors sharp.
          </motion.p>
        </AnimatedSection>

        {/* Pipeline — desktop board (sm and up) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LANES.map((lane, laneIdx) => {
            const laneGames = groupedByStage[lane.id]
            return (
              <AnimatedSection key={lane.id} delay={laneIdx * 0.1} direction="up">
                <div className="h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
                  <div className={`px-5 py-4 bg-gradient-to-b ${lane.accent} border-b border-border/40`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <lane.icon className="h-4 w-4" />
                        <span className="text-sm font-semibold uppercase tracking-wider">{lane.label}</span>
                      </div>
                      <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-background/70 text-xs font-semibold text-foreground/80">
                        {laneGames.length}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{lane.blurb}</p>
                  </div>

                  <div className="p-3 space-y-2 flex-1">
                    {laneGames.length === 0 ? emptyState : laneGames.map(renderCard)}
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

        {/* Pipeline — mobile tabs (below sm) */}
        <div className="sm:hidden">
          {/* Stage tab strip — horizontally scrollable */}
          <div className="flex gap-7 overflow-x-auto border-b border-border/60 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LANES.map((lane) => {
              const count = groupedByStage[lane.id].length
              const isActive = activeStage === lane.id
              return (
                <button
                  key={lane.id}
                  type="button"
                  onClick={() => setActiveStage(lane.id)}
                  className={`relative flex-shrink-0 inline-flex items-center gap-2 pt-1 pb-3 text-sm font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <lane.icon className="h-4 w-4" />
                  {lane.label}
                  <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-foreground/40'}`}>
                    {count}
                  </span>
                  <span
                    className={`absolute -bottom-px left-0 h-0.5 bg-primary transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Active stage panel */}
          {LANES.filter((l) => l.id === activeStage).map((lane) => {
            const laneGames = groupedByStage[lane.id]
            return (
              <div key={lane.id} className="mt-4 rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
                <div className={`px-5 py-4 bg-gradient-to-b ${lane.accent} border-b border-border/40`}>
                  <p className="text-xs text-muted-foreground leading-relaxed">{lane.blurb}</p>
                </div>
                <div className="p-3 space-y-2">
                  {laneGames.length === 0 ? emptyState : laneGames.map(renderCard)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <AnimatedSection delay={0.5} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Want to follow what survives the gauntlet?{' '}
            <button
              type="button"
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Get devlog updates &rarr;
            </button>
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
