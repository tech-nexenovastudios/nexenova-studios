import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Briefcase, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { getRoleBySlug, type CareerPosting } from '../../data/careers'
import { ApplicationForm } from './ApplicationForm'
import { applySeo, careerNotFoundSeo, careerSeo } from '../../utils/seo'
import { AppLink } from '../AppLink'

interface CareerDetailPageProps {
  slug: string
  onNavigateHome: () => void
  onNavigateToCareers: () => void
}

export function CareerDetailPage({ slug, onNavigateHome, onNavigateToCareers }: CareerDetailPageProps) {
  const [role, setRole] = useState<CareerPosting | null | undefined>(undefined)

  useEffect(() => {
    getRoleBySlug(slug).then(setRole)
  }, [slug])

  useEffect(() => {
    if (role === undefined) return
    if (role === null) {
      applySeo(careerNotFoundSeo(slug))
      return
    }
    applySeo(careerSeo(role))
  }, [role, slug])

  if (role === undefined) {
    return <div className="min-h-screen bg-background pt-32 text-center text-muted-foreground">Loading…</div>
  }

  if (role === null) {
    return (
      <div className="min-h-screen bg-background pt-32 flex flex-col items-center text-center px-4">
        <h1 className="text-2xl font-bold mb-3">Role not found</h1>
        <p className="text-muted-foreground mb-6">It may have been closed or never existed.</p>
        <Button asChild>
          <AppLink href="/careers" onNavigate={onNavigateToCareers}>See open roles</AppLink>
        </Button>
      </div>
    )
  }

  const applyEmail = role.apply_email || 'support@nexenovastudios.com'

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
              <AppLink href="/careers" onNavigate={onNavigateToCareers}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                All roles
              </AppLink>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Briefcase className="h-6 w-6" />
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Careers
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">{role.title}</h1>
            {role.short_summary && (
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{role.short_summary}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground">
              {role.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {role.location}
                </span>
              )}
              {role.employment_type && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {role.employment_type}
                </span>
              )}
            </div>
            <div className="mt-8">
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Apply for this role
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-a:text-primary prose-a:underline-offset-4">
          <ReactMarkdown>{role.description}</ReactMarkdown>
        </article>

        <Card id="apply" className="mt-12 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-2xl">Apply for {role.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in the form below. Your resume goes to a private inbox &mdash; only the studio can read it.
              Trouble?{' '}
              <a href={`mailto:${applyEmail}?subject=${encodeURIComponent(`${role.title} — application`)}`} className="text-primary hover:underline">
                Email {applyEmail}
              </a>
              .
            </p>
          </CardHeader>
          <CardContent>
            <ApplicationForm roleSlug={role.slug} roleTitle={role.title} />
          </CardContent>
        </Card>

        <div className="mt-10 pt-8 border-t border-border/60 flex items-center justify-between text-sm">
          <Button asChild variant="ghost" size="sm">
            <AppLink href="/careers" onNavigate={onNavigateToCareers}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              All roles
            </AppLink>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <AppLink href="/" onNavigate={onNavigateHome}>Home</AppLink>
          </Button>
        </div>
      </main>
    </div>
  )
}
