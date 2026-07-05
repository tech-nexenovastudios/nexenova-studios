import { motion } from 'motion/react'
import { Card, CardContent } from './ui/card'
import {
  Coffee,
  Compass,
  Hammer,
  Heart,
  MapPin,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

interface AboutSectionProps {
  description?: string
}

export function AboutSection({ description: _description }: AboutSectionProps) {
  const principles = [
    {
      icon: Target,
      title: 'One core loop. Polished hard.',
      body: "We'd rather ship one mechanic that won't let go than ten that almost click.",
    },
    {
      icon: Coffee,
      title: 'Built for the coffee break.',
      body: 'Three-minute sessions. Tap-to-start. Designed to fit between life, not steal from it.',
    },
    {
      icon: Heart,
      title: "We ship what we'd play.",
      body: 'No cynical clones. No dark patterns. If we wouldn’t open it on a Tuesday afternoon, it doesn’t ship.',
    },
    {
      icon: MapPin,
      title: 'Made in India, made for the world.',
      body: 'A small team, an honest pipeline, and a stubborn belief that great mobile games can come from anywhere.',
    },
  ]

  const playbook = [
    { icon: Sparkles, label: 'Prototype fast', body: 'Multiple concepts, parallel sprints, AI in the loop. Get a playable build in front of a thumb in week one.' },
    { icon: Compass, label: 'Playtest early', body: 'Real players, real devices, before we add anything that isn’t the core loop.' },
    { icon: XCircle, label: 'Kill what doesn’t click', body: 'Strict gates. If a prototype doesn’t hook in 60 seconds, it doesn’t survive.' },
    { icon: Hammer, label: 'Polish the survivor', body: 'One winner per cycle gets the attention. Level design, juice, monetization — then launch.' },
  ]

  return (
    <section id="about" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block text-xs uppercase tracking-[0.22em] text-primary font-medium mb-4"
          >
            About the Studio
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Small studio.<br className="hidden sm:block" /> Sharp focus.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            We&rsquo;re an indie mobile games studio building in the open from India &mdash; using AI to prototype faster and kill bad ideas sooner. We don&rsquo;t make games for hire. We make the games we wish someone else had made first &mdash; then we keep iterating until they&rsquo;re the kind of thing you reopen ten times a day.
          </motion.p>
        </AnimatedSection>

        {/* Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {principles.map((p, i) => (
            <AnimatedSection
              key={p.title}
              delay={i * 0.08}
              direction={i % 2 === 0 ? 'left' : 'right'}
            >
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow h-full bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-7">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                        <p.icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 leading-tight">{p.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{p.body}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Playbook */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-0">
              <div className="lg:col-span-5 p-8 lg:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b lg:border-b-0 lg:border-r border-border/60">
                <span className="inline-block text-xs uppercase tracking-[0.22em] text-primary font-medium mb-3">
                  Our Playbook
                </span>
                <h3 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
                  Hunt for the loop. <br />Kill the rest.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every game we make goes through the same gauntlet: prototype, playtest, kill, polish. Most concepts don&rsquo;t make it past week three. The ones that do earn the right to be made.
                </p>
              </div>
              <div className="lg:col-span-7 p-8 lg:p-10">
                <ul className="space-y-5">
                  {playbook.map((step, i) => (
                    <motion.li
                      key={step.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/60 text-primary flex-shrink-0">
                        <step.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-semibold mb-1">
                          <span className="text-muted-foreground text-sm font-mono mr-2">0{i + 1}</span>
                          {step.label}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
