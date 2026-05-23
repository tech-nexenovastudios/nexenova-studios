import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
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
  const transformedGame = {
    id: game.id,
    title: game.title || 'Unknown Game',
    tags: game.tags || [],
    description: game.fullDescription || game.description || 'No description available.',
    images: (game.screenshots && game.screenshots.length > 0) ? game.screenshots : (game.image ? [game.image] : []),
    videoId: game.videoUrl ? extractVideoId(game.videoUrl) : 'dQw4w9WgXcQ',
    steamUrl: game.steamUrl || '',
    features: [
      game.genre && `Genre: ${game.genre}`,
      `Status: ${game.status || 'Unknown'}`,
      (game.platform && game.platform.length > 0) && `Platforms: ${game.platform.join(', ')}`,
      game.rating && `Rating: ${game.rating}/10`,
      game.downloads && `Downloads: ${game.downloads}`,
      game.releaseDate && `Release Date: ${new Date(game.releaseDate).toLocaleDateString()}`
    ].filter(Boolean)
  }

  const nextImage = () => {
    if (transformedGame.images && transformedGame.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % transformedGame.images.length)
    }
  }

  const prevImage = () => {
    if (transformedGame.images && transformedGame.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + transformedGame.images.length) % transformedGame.images.length)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 bg-gradient-to-br from-background to-secondary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{transformedGame.title}</h1>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {transformedGame.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            {transformedGame.features.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-8">
                {transformedGame.features.map((feature, i) => (
                  <span key={i} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </span>
                ))}
              </div>
            )}
            {transformedGame.steamUrl && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => window.open(transformedGame.steamUrl, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>View on Store</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Video Section - Only show if there's a video */}
      {transformedGame.videoId && transformedGame.videoId !== 'dQw4w9WgXcQ' && (
        <motion.section
          className="py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Gameplay Video</h2>
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${transformedGame.videoId}`}
                  title={`${transformedGame.title} Gameplay Video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Description Section */}
      <motion.section
        className="py-20 bg-secondary/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">About the Game</h2>
            {transformedGame.description ? (
              <div className="relative">
                <div
                  className={`prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-primary overflow-hidden transition-[max-height] duration-500 ${
                    aboutExpanded ? 'max-h-[12000px]' : 'max-h-80'
                  }`}
                >
                  <ReactMarkdown>{transformedGame.description}</ReactMarkdown>
                </div>
                {!aboutExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary/10 to-transparent" />
                )}
                <button
                  type="button"
                  onClick={() => setAboutExpanded((v) => !v)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  {aboutExpanded ? (
                    <>
                      Show less
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read more
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p>No description available.</p>
            )}
          </div>
        </div>
      </motion.section>

      {/* Gallery Section */}
      {transformedGame.images && transformedGame.images.length > 0 && (
        <motion.section
          className="py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={transformedGame.images[currentImageIndex] || ''}
                    alt={`${transformedGame.title} screenshot ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Navigation arrows */}
                {transformedGame.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                <div className="flex justify-center mt-4 space-x-2">
                  {transformedGame.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

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
                  <span>View on Store</span>
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