import { motion } from 'motion/react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Github, Linkedin, Twitter, Code, Gamepad2, Palette, Sparkles, Bug } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'

interface TeamMember {
  id: number
  name: string
  role: string
  image?: string
  bio: string
}

interface TeamSectionProps {
  teamMembers?: TeamMember[]
  onNavigateToCareers?: () => void
}

type TeamCard = {
  name: string
  role: string
  bio: string
  skills: string[]
  social: { github?: string; linkedin?: string; twitter?: string }
}

const FALLBACK_TEAM: TeamCard[] = [
  {
    name: 'Founder & Game Designer',
    role: 'Designs the loops',
    bio: "Sketches mechanics on napkins, plays them obsessively, kills the ones that don't click within sixty seconds.",
    skills: ['Game Design', 'Level Design', 'Pitching'],
    social: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Engineering Lead',
    role: 'Builds it',
    bio: 'Turns prototype sketches into 60-fps reality. Lives in Unity. Has strong opinions about input latency.',
    skills: ['Unity', 'C#', 'Mobile Performance'],
    social: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Art & Juice',
    role: 'Makes it feel good',
    bio: 'Shaders, screen-shake, that little particle burst when something clicks. The polish you feel before you see.',
    skills: ['2D Art', 'VFX', 'Animation'],
    social: { github: '#', linkedin: '#', twitter: '#' },
  },
]

function getSkillsForRole(role: string): string[] {
  const map: Record<string, string[]> = {
    CEO: ['Studio Direction', 'Pipeline', 'Strategy'],
    Founder: ['Studio Direction', 'Pipeline', 'Strategy'],
    'Technical Lead': ['Architecture', 'Backend', 'Build Pipeline'],
    'Game Designer': ['Core Loops', 'Level Design', 'Playtesting'],
    'Lead Developer': ['Unity', 'C#', 'Mobile Performance'],
    'Unity Developer': ['Unity', 'C#', 'Mobile Performance'],
    'Unreal Engine Developer': ['Unreal', 'C++', 'Tools'],
    Engineer: ['Unity', 'C#', 'Mobile Performance'],
    'Game Artist': ['2D Art', 'Animation', 'Concept'],
    'Senior 2D Artist': ['2D Art', 'Direction', 'Concept'],
    '2D Artist': ['2D Art', 'Animation', 'Concept'],
    '3D Artist': ['3D Modeling', 'Texturing', 'Animation'],
    '3D / 2D Animator': ['Rigging', 'Animation', 'Juice'],
    Animator: ['Rigging', 'Animation', 'Juice'],
    'QA Tester': ['Edge Cases', 'Repro Cases', 'Device Coverage'],
    QA: ['Edge Cases', 'Repro Cases', 'Device Coverage'],
    'Sound Engineer': ['SFX', 'Music', 'Mixing'],
  }
  return map[role] || ['Game Development']
}

function getRoleIcon(role: string) {
  const r = role.toLowerCase()
  const has = (term: string) => r.indexOf(term) !== -1
  if (has('qa') || has('test')) return <Bug className="h-6 w-6" />
  if (has('animator')) return <Sparkles className="h-6 w-6" />
  if (has('art') || has('design')) return <Palette className="h-6 w-6" />
  if (has('developer') || has('engineer')) return <Code className="h-6 w-6" />
  if (has('juice') || has('vfx') || has('sound')) return <Sparkles className="h-6 w-6" />
  return <Gamepad2 className="h-6 w-6" />
}

export function TeamSection({ teamMembers = [], onNavigateToCareers }: TeamSectionProps) {
  const team: TeamCard[] =
    teamMembers.length > 0
      ? teamMembers.map((m) => ({
          name: m.name,
          role: m.role,
          bio: m.bio,
          skills: getSkillsForRole(m.role),
          social: { github: '#', linkedin: '#', twitter: '#' },
        }))
      : FALLBACK_TEAM

  return (
    <section id="team" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block text-xs uppercase tracking-[0.22em] text-primary font-medium mb-4"
          >
            The Team
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-5 tracking-tight"
          >
            Meet the makers.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Small team. No layers. Every person here ships the game from sketch to store.
          </motion.p>
        </AnimatedSection>

        <Carousel
          opts={{ align: 'start', loop: false }}
          className="w-full max-w-6xl mx-auto px-2 sm:px-10"
        >
          <CarouselContent className="-ml-4">
            {team.map((member, index) => (
              <CarouselItem
                key={index}
                className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className="h-full">
                  <Card className="group border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-7 text-center flex flex-col h-full">
                      <div className="relative mb-5">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center ring-1 ring-border/40 group-hover:scale-105 transition-transform">
                          <div className="text-primary">{getRoleIcon(member.role)}</div>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-1 leading-tight">{member.name}</h3>
                      <p className="text-sm text-primary uppercase tracking-wider font-medium mb-4">{member.role}</p>
                      <p className="text-muted-foreground text-sm mb-5 leading-relaxed flex-1">{member.bio}</p>

                      <div className="flex flex-wrap gap-1.5 justify-center mb-5">
                        {member.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-center gap-1">
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="GitHub"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.twitter && (
                          <a
                            href={member.social.twitter}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Twitter"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        <AnimatedSection delay={0.3} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            We&rsquo;re hiring craft we believe in.{' '}
            {onNavigateToCareers ? (
              <button
                type="button"
                onClick={onNavigateToCareers}
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                See open roles &rarr;
              </button>
            ) : (
              <a
                href="/careers"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                See open roles &rarr;
              </a>
            )}
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
