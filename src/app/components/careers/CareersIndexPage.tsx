import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { listOpenRoles, type CareerPosting } from '../../data/careers'

interface CareersIndexPageProps {
  onNavigateHome: () => void
  onNavigateToRole: (slug: string) => void
}

export function CareersIndexPage({ onNavigateHome, onNavigateToRole }: CareersIndexPageProps) {
  const [roles, setRoles] = useState<CareerPosting[] | null>(null)

  useEffect(() => {
    listOpenRoles().then(setRoles)
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
                <Briefcase className="h-6 w-6" />
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Careers
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Build with us.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Small team. No layers. Every craft we hire for ships the game from sketch to store. Open roles below — don&rsquo;t see your fit? Email{' '}
              <a href="mailto:tech@nexenovastudios.com" className="font-medium text-primary hover:underline underline-offset-4">
                tech@nexenovastudios.com
              </a>{' '}
              anyway.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {roles === null ? (
          <div className="text-center py-20 text-muted-foreground">Loading roles…</div>
        ) : roles.length === 0 ? (
          <Card className="border-border/60 bg-muted/30">
            <CardContent className="p-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No open roles right now.</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We&rsquo;re a small studio and we hire deliberately. If our work pulls you, drop us your portfolio.
              </p>
              <Button asChild>
                <a href="mailto:tech@nexenovastudios.com">Get in touch</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                type="button"
                onClick={() => onNavigateToRole(role.slug)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -2 }}
                className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-2xl"
              >
                <Card className="border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-md hover:border-primary/40 transition-all">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                        <Briefcase className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                            {role.title}
                          </h2>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0 mt-1" />
                        </div>
                        {role.short_summary && (
                          <p className="text-muted-foreground mb-4 leading-relaxed">{role.short_summary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          {role.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {role.location}
                            </span>
                          )}
                          {role.employment_type && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {role.employment_type}
                            </span>
                          )}
                        </div>
                      </div>
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
