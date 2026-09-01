import { ChevronDown, ChevronUp, ExternalLink, Play } from 'lucide-react'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { StatusPill } from '../GameStatusPill'
import { StoreBadges } from '../StoreBadges'
import { stageOf } from '../../data/stages'
import { Card, CardContent } from '../ui/card'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { useState } from 'react'

interface Game {
  id: string
  title: string
  description: string
  fullDescription: string
  image: string
  tags: string[]
  steamUrl?: string
  playStoreUrl?: string
  appStoreUrl?: string
  /** Hue sampled from this game's key art; see gameAccent(). */
  accentHue?: number
  status: string
  downloads: string
  rating: number
  screenshots: string[]
  videoUrl?: string
  releaseDate: string
  genre: string
  platform: string[]
}

interface GamePageProps {
  game: Game
  onNavigateHome: () => void
  onNavigateToGame?: (gameId: string) => void
  relatedGames?: Game[]
}

// Helper function to extract YouTube video ID from URL
function extractVideoId(url: string): string {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/)?([^&\n?#]+)/)
  return match ? match[1] : 'dQw4w9WgXcQ'
}

/**
 * Per-game accent, sampled from its key art.
 *
 * Only the HUE comes from the artwork. Lightness and chroma are pinned to the
 * site's own accent values (L .78 / C .148), which is what keeps every game
 * page above 9:1 on the black ground — a raw "dominant colour" lifted from a
 * PNG would be arbitrarily dark, washed out, or neon.
 *
 * The hue is also the artwork's most DISTINCTIVE colour, not its most common
 * one: every card shares a purple-blue background, so dominant-colour sampling
 * put all eight games within 260-310 degrees and made the pages look identical.
 */
function gameAccent(game: Game): string | undefined {
  return typeof game.accentHue === 'number'
    ? `oklch(0.78 0.148 ${game.accentHue})`
    : undefined
}

export function GamePage({ game, onNavigateHome, onNavigateToGame, relatedGames = [] }: GamePageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [aboutExpanded, setAboutExpanded] = useState(false)

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Button onClick={onNavigateHome}>Return Home</Button>
        </div>
      </div>
    )
  }

  // Transform the game data for display
  const [playing, setPlaying] = useState(false)

  const transformedGame = {
    id: game.id,
    title: game.title || 'Unknown Game',
    tags: game.tags || [],
    description: game.fullDescription || game.description || 'No description available.',
    images: (game.screenshots && game.screenshots.length > 0) ? game.screenshots : (game.image ? [game.image] : []),
    videoId: game.videoUrl ? extractVideoId(game.videoUrl) : '',
    steamUrl: game.playStoreUrl || game.steamUrl || '',
    features: [
      game.genre && `Genre: ${game.genre}`,
      (game.platform && game.platform.length > 0) && `Platforms: ${game.platform.join(', ')}`,
      game.rating && `Rating: ${game.rating}/10`,
      game.downloads && `Downloads: ${game.downloads}`,
      game.releaseDate && `Release Date: ${new Date(game.releaseDate).toLocaleDateString()}`
    ].filter(Boolean)
  }

  const accent = gameAccent(game)

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-background pt-16"
      // Overrides the section accent for this page only; the artwork tints the
      // headings, buttons, pills and glow without any component knowing about it.
      style={accent ? ({ '--section-accent': accent } as Record<string, string>) : undefined}
    >
      {/* A wash of the game's own colour behind the fold */}
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{ background: `radial-gradient(70% 55% at 62% 0%, color-mix(in oklab, ${accent} 16%, transparent), transparent 72%)` }}
        />
      )}
      {/* Overview — copy on the left, artwork on the right. These used to be
          four stacked full-height sections (hero, trailer, about, gallery),
          which made a short page scroll for a very long time. */}
      <motion.section
        className="py-12 md:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">

            {/* LEFT — identity and copy */}
            <div className="lg:col-span-7">
              <StatusPill stage={stageOf(game)} />

              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.035em] md:text-5xl">
                {transformedGame.title}
              </h1>

              {transformedGame.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {transformedGame.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {transformedGame.features.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {transformedGame.features.map((feature, i) => (
                    <span key={i} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--section-accent)]" />
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-7 max-w-sm">
                <StoreBadges
                  playStoreUrl={game.playStoreUrl}
                  appStoreUrl={game.appStoreUrl}
                  title={transformedGame.title}
                />
              </div>

              <h2 className="mt-10 mb-4 text-xl font-extrabold tracking-tight">About the game</h2>
              {transformedGame.description ? (
                <div className="relative">
                  <div
                    className={`prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-[var(--section-accent)] overflow-hidden transition-[max-height] duration-500 ${
                      aboutExpanded ? 'max-h-[12000px]' : 'max-h-72'
                    }`}
                  >
                    <ReactMarkdown>{transformedGame.description}</ReactMarkdown>
                  </div>
                  {!aboutExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
                  )}
                  <button
                    type="button"
                    onClick={() => setAboutExpanded((v) => !v)}
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--section-accent)] hover:underline underline-offset-4"
                  >
                    {aboutExpanded ? (<>Show less<ChevronUp className="h-4 w-4" /></>) : (<>Read more<ChevronDown className="h-4 w-4" /></>)}
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </div>

            {/* RIGHT — artwork, doubling as the trailer poster when there is one */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-[var(--surface-2)]">
                  {playing && transformedGame.videoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${transformedGame.videoId}?autoplay=1&rel=0`}
                      title={`${transformedGame.title} trailer`}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <ImageWithFallback
                        src={transformedGame.images[currentImageIndex] || ''}
                        alt={`${transformedGame.title} artwork`}
                        width={800}
                        height={1200}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {transformedGame.videoId && (
                        <button
                          type="button"
                          onClick={() => setPlaying(true)}
                          aria-label={`Play the ${transformedGame.title} trailer`}
                          className="group absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/40"
                        >
                          <span
                            className="flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                            style={{ backgroundColor: 'var(--section-accent)' }}
                          >
                            <Play className="ml-1 h-7 w-7 fill-current text-[var(--background)]" />
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {transformedGame.images.length > 1 && (
                  <div className="mt-3 flex gap-2">
                    {transformedGame.images.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => { setCurrentImageIndex(index); setPlaying(false) }}
                        aria-label={`Show artwork ${index + 1}`}
                        className="aspect-[2/3] w-14 overflow-hidden rounded-lg border transition-colors"
                        style={{ borderColor: index === currentImageIndex ? 'var(--section-accent)' : 'var(--border)' }}
                      >
                        <ImageWithFallback src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Related Games Section */}
      {relatedGames && relatedGames.length > 0 && (
        <motion.section 
          className="py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">More Games</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {relatedGames.map((relatedGame) => (
                <Card 
                  key={relatedGame.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => onNavigateToGame && onNavigateToGame(relatedGame.id)}
                >
                  <div className="aspect-video bg-muted">
                    <ImageWithFallback
                      src={relatedGame.image}
                      alt={relatedGame.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{relatedGame.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {relatedGame.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {relatedGame.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Contact Section */}
      <motion.section 
        className="py-20 bg-secondary/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Like what you see?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Follow the studio for launch updates &mdash; or browse the rest of what we&rsquo;re making.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {transformedGame.steamUrl && (
                <Button
                  size="lg"
                  onClick={() => window.open(transformedGame.steamUrl, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Get it on Google Play</span>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={onNavigateHome}
              >
                See all games
              </Button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}