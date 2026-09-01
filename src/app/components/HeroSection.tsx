import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { ArrowRight, Gamepad2, Play, Sparkles } from 'lucide-react'
import gamesSeed from '../data/games.seed.json'
import { STAGES, stageColor, stageOf } from '../data/stages'
import { StatusPill } from './GameStatusPill'

interface SeedGame {
  id: string
  title: string
  image: string
  description: string
  tags: string[]
  status: string
  tagline?: string
}

interface HeroSectionProps {
  onGameSelect?: (gameId: string) => void
}

const REEL_INTERVAL_MS = 4500

export function HeroSection({ onGameSelect }: HeroSectionProps) {
  // The reel is artwork-driven, so only titles that actually have key art
  // belong in it — an entry with no image would flash an empty frame.
  const games = (gamesSeed as SeedGame[]).filter(g => g.image?.startsWith('/')).slice(0, 6)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || games.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % games.length), REEL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused, games.length])

  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' })
  }

  const current = games[index]

  // Live stage split across the whole seed (not just the reel's six).
  const allGames = gamesSeed as SeedGame[]
  const liveNow = allGames.filter(g => stageOf(g) === 'live').length
  const distribution = STAGES.map(stage => ({
    id: stage.id,
    label: stage.short,
    color: stageColor(stage.id),
    count: allGames.filter(g => stageOf(g) === stage.id).length,
  })).filter(d => d.count > 0)

  return (
    <section
      id="home"
      className="section-hero min-h-screen flex items-center justify-center bg-background pt-20 pb-12 relative overflow-hidden"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [-100, 100, -50, 150, -100], y: [-50, 80, -100, 50, -50], scale: [1, 1.3, 0.8, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--brand-purple) 22%, transparent), transparent 68%)' }}
          className="absolute top-20 left-20 w-[32rem] h-[32rem] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [200, -150, 100, -200, 200], y: [100, -80, 120, -60, 100], scale: [1.2, 0.9, 1.4, 0.7, 1.2] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--brand-cyan) 20%, transparent), transparent 68%)' }}
          className="absolute bottom-20 right-20 w-[34rem] h-[34rem] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [-200, 250, -100, 200, -200], y: [200, -150, 100, -200, 200], scale: [0.8, 1.5, 1, 1.2, 0.8] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--brand-blue) 16%, transparent), transparent 70%)' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{ backgroundColor: 'color-mix(in oklab, var(--section-accent) 12%, transparent)', borderColor: 'color-mix(in oklab, var(--section-accent) 30%, transparent)' }}
            >
              <Sparkles className="h-4 w-4 text-[var(--section-accent)]" />
              <span className="text-sm font-medium text-[var(--section-accent)]">
                {liveNow} games live on Google Play · made in India
              </span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] mb-6 leading-[1.0]">
              <span className="block">Pick up.</span>
              <span className="block">Play.</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(100deg, var(--brand-purple), var(--brand-blue) 55%, var(--brand-cyan))' }}
              >
                Don&rsquo;t put down.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              An independent mobile studio crafting puzzle &amp; action games built to fit your coffee break — and steal the rest of your afternoon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                onClick={() => scrollTo('#portfolio')}
                className="group text-base px-8 h-12"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Our Games
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo('#about')}
                className="text-base px-8 h-12"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Meet the Studio
              </Button>
            </div>

            {/* Where the lineup actually stands. Counts come from the seed via
                stageOf(), so this can never drift from the games grid. */}
            <div className="mt-2 border-t border-border pt-6">
              <span className="section-eyebrow mb-3 inline-block">Where they stand today</span>
              <div className="flex h-2 gap-1 overflow-hidden rounded-full" role="img"
                   aria-label={distribution.map(d => `${d.count} ${d.label}`).join(', ')}>
                {distribution.map(d => (
                  <span
                    key={d.id}
                    className="block rounded-full"
                    style={{ flexGrow: d.count, backgroundColor: d.color }}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {distribution.map(d => (
                  <span key={d.id} className="inline-flex items-center gap-2 font-mono text-xs">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span style={{ color: d.color }}>{d.label}</span>
                    <span className="text-muted-foreground">{d.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: rotating game reel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Same key art, same status pill and same copy as the games grid —
                both read games.seed.json, so the reel can't drift from it. */}
            <div className="relative mx-auto aspect-[2/3] max-w-[19rem]">
              <AnimatePresence mode="wait">
                <motion.button
                  key={current.id}
                  type="button"
                  onClick={() => onGameSelect?.(current.id)}
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -16 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="group absolute inset-0 overflow-hidden rounded-2xl border border-border text-left focus:outline-none focus:ring-2 focus:ring-[var(--section-accent)] focus:ring-offset-2 focus:ring-offset-background"
                  aria-label={`Open ${current.title}`}
                >
                  <img
                    src={current.image}
                    alt={current.title}
                    width={800}
                    height={1200}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  <div className="absolute left-3 top-3 z-10">
                    <StatusPill stage={stageOf(current)} />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-16">
                    <h3 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white">
                      {current.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-white/75">
                      {current.description}
                    </p>
                    <span className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--section-accent)]">
                      See the game
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </motion.button>
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {games.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${g.title}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-8 bg-[var(--section-accent)]' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
