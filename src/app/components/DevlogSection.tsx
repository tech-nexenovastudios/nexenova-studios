import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Calendar, FileText } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { AnimatedSection } from './AnimatedSection'
import { listPosts, type DevlogPost } from '../data/devlog'
import { handleNavClick } from './AppLink'

interface DevlogSectionProps {
  onNavigateToDevlog: () => void
  onNavigateToPost: (slug: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function DevlogSection({ onNavigateToDevlog, onNavigateToPost }: DevlogSectionProps) {
  const [posts, setPosts] = useState<DevlogPost[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    listPosts(3).then((p) => {
      setPosts(p)
      setLoaded(true)
    })
  }, [])

  // Hide the entire section if there's nothing to show — keeps the homepage
  // tight when the devlog is empty.
  if (loaded && posts.length === 0) return null

  return (
    <section id="devlog" className="section-devlog py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="section-eyebrow mb-4 inline-block"
          >
            From the Studio
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight"
          >
            Latest devlog.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Build notes, soft-launch reports, and postmortems &mdash; written between commits.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 0.1} direction="up">
              <motion.a
                href={`/devlog/${post.slug}`}
                onClick={handleNavClick(() => onNavigateToPost(post.slug))}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="block w-full text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl"
              >
                <Card className="border-border/60 bg-[var(--surface-1)] backdrop-blur-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--section-accent)_12%,transparent)] text-[var(--section-accent)] mb-4 flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.published_at)}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 leading-tight group-hover:text-[var(--section-accent)] transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-1 text-sm font-medium text-[var(--section-accent)] group-hover:translate-x-1 transition-transform">
                      Read post
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="text-center">
          <motion.a
            href="/devlog"
            onClick={handleNavClick(onNavigateToDevlog)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors font-medium"
          >
            Read all posts
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </AnimatedSection>
      </div>
    </section>
  )
}

