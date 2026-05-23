import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { ExternalLink, Play } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination'

const PAGE_SIZE = 6

interface Game {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  status: string
  platform: string[]
  steamUrl?: string
}

interface PortfolioSectionProps {
  games?: Game[]
  onGameSelect?: (gameId: string) => void
}

export function PortfolioSection({ games = [], onGameSelect }: PortfolioSectionProps) {
  // Map the games to the format expected by the component
  const projects = games.map(game => ({
    id: game.id,
    gameId: game.id,
    title: game.title,
    description: game.description,
    image: game.image,
    tags: game.tags,
    status: game.status,
    platforms: game.platform,
    url: game.steamUrl
  }))

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE))
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 if the underlying list shrinks below the current page
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  const paginatedProjects = projects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages)
    setCurrentPage(target)
    // Scroll the portfolio heading back into view so users see the new cards
    requestAnimationFrame(() => {
      document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const handleViewMore = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    } else {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const isLastPage = currentPage >= totalPages

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
      case 'Released': return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'Coming Soon': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'In Development': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <section id="portfolio" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Portfolio</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our diverse collection of games spanning multiple genres and platforms, 
            each crafted with attention to detail and passion for gaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No games found.</p>
            </div>
          ) : (
            paginatedProjects.map((project) => (
              <Card 
              key={project.id} 
              className="group overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (project.gameId && onGameSelect) {
                  onGameSelect(project.gameId)
                } else if (project.url) {
                  window.open(project.url, '_blank')
                }
              }}
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Available on:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.platforms.map((platform, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#portfolio"
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) goToPage(currentPage - 1)
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#portfolio"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      goToPage(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#portfolio"
                  aria-disabled={isLastPage}
                  className={isLastPage ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!isLastPage) goToPage(currentPage + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {isLastPage
              ? 'Want to see more of our work or discuss a custom project?'
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${(currentPage - 1) * PAGE_SIZE + paginatedProjects.length} of ${projects.length} projects.`}
          </p>
          <button
            onClick={handleViewMore}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {isLastPage ? 'Get in Touch' : 'View More Projects'}
          </button>
        </div>
      </div>
    </section>
  )
}