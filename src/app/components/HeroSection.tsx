import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ArrowRight, Gamepad2, Play, Sparkles } from 'lucide-react'
import gamesSeed from '../data/games.seed.json'

interface SeedGame {
  id: string
  title: string
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
  const games = (gamesSeed as SeedGame[]).slice(0, 6)
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

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 pt-20 pb-12 relative overflow-hidden"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [-100, 100, -50, 150, -100], y: [-50, 80, -100, 50, -50], scale: [1, 1.3, 0.8, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [200, -150, 100, -200, 200], y: [100, -80, 120, -60, 100], scale: [1.2, 0.9, 1.4, 0.7, 1.2] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-secondary/8 to-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [-200, 250, -100, 200, -200], y: [200, -150, 100, -200, 200], scale: [0.8, 1.5, 1, 1.2, 0.8] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-accent/6 to-secondary/8 rounded-full blur-3xl"
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                12 games in the pipeline · made in India
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              <span className="block">Pick up.</span>
              <span className="block">Play.</span>
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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

            <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start text-sm">
              <div>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-muted-foreground">Games in the lineup</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">1</div>
                <div className="text-muted-foreground">Currently in soft-launch prep</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">Puzzle / Action</div>
                <div className="text-muted-foreground">Our home genres</div>
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
            <div className="relative aspect-[4/5] max-w-sm mx-auto">
              <AnimatePresence mode="wait">
                <motion.button
                  key={current.id}
                  type="button"
                  onClick={() => onGameSelect?.(current.id)}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-3xl overflow-hidden text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 focus:ring-offset-background"
                  aria-label={`Open ${current.title}`}
                >
                  {/* Card bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />
                  <div className="absolute inset-0 bg-card/40 backdrop-blur-sm border border-border/40 rounded-3xl" />

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-6">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="bg-background/70 backdrop-blur-sm">
                        {current.status}
                      </Badge>
                      <div className="h-12 w-12 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/40 flex items-center justify-center">
                        <Gamepad2 className="h-5 w-5 text-foreground/80" />
                      </div>
                    </div>

                    <div>
                      {current.tagline && (
                        <p className="text-xs uppercase tracking-[0.18em] text-foreground/70 mb-2">
                          {current.tagline}
                        </p>
                      )}
                      <h3 className="text-3xl md:text-4xl font-bold mb-3 text-foreground leading-tight">
                        {current.title}
                      </h3>
                      <p className="text-sm text-foreground/80 line-clamp-3 mb-4">
                        {current.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                        See the game
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
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
                    i === index ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
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
