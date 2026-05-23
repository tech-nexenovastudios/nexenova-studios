import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Calendar, FileText } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { listPosts, type DevlogPost } from '../../data/devlog'

interface DevlogIndexPageProps {
  onNavigateHome: () => void
  onNavigateToPost: (slug: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function DevlogIndexPage({ onNavigateHome, onNavigateToPost }: DevlogIndexPageProps) {
  const [posts, setPosts] = useState<DevlogPost[] | null>(null)

  useEffect(() => {
    listPosts(30).then(setPosts)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FileText className="h-6 w-6" />
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Devlog
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">From the studio.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Build notes, soft-launch reports, and the occasional postmortem on a prototype that didn&rsquo;t make it. Honest, unpolished, written between commits.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {posts === null ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No posts yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <motion.button
                key={post.id}
                type="button"
                onClick={() => onNavigateToPost(post.slug)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-2xl"
              >
                <Card className="border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
                  {post.cover_image && (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.published_at)}
                    </div>
                    <h2 className="text-xl font-semibold mb-2 leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
