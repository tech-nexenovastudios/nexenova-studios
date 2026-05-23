import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { getPostBySlug, type DevlogPost } from '../../data/devlog'

interface DevlogPostPageProps {
  slug: string
  onNavigateHome: () => void
  onNavigateToDevlog: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function DevlogPostPage({ slug, onNavigateHome, onNavigateToDevlog }: DevlogPostPageProps) {
  const [post, setPost] = useState<DevlogPost | null | undefined>(undefined)

  useEffect(() => {
    getPostBySlug(slug).then(setPost)
  }, [slug])

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-background pt-32 flex flex-col items-center text-center px-4">
        <h1 className="text-2xl font-bold mb-3">Post not found</h1>
        <p className="text-muted-foreground mb-6">It may have been unpublished or never existed.</p>
        <Button onClick={onNavigateToDevlog}>Back to Devlog</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToDevlog}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All posts
            </Button>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-wider">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">{post.title}</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published_at)}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {post.cover_image && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-muted">
            <ImageWithFallback
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-primary prose-a:underline-offset-4">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-border/60 flex items-center justify-between text-sm">
          <Button variant="ghost" size="sm" onClick={onNavigateToDevlog}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            All posts
          </Button>
          <Button variant="ghost" size="sm" onClick={onNavigateHome}>
            Home
          </Button>
        </div>
      </main>
    </div>
  )
}
