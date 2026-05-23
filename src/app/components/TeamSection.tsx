import { motion } from 'motion/react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Github, Linkedin, Twitter, Code, Gamepad2, Palette, Sparkles } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

interface TeamMember {
  id: number
  name: string
  role: string
  image?: string
  bio: string
}

interface TeamSectionProps {
  teamMembers?: TeamMember[]
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
    'Game Designer': ['Core Loops', 'Level Design', 'Playtesting'],
    'Lead Developer': ['Unity', 'C#', 'Mobile Performance'],
    'Unity Developer': ['Unity', 'C#', 'Mobile Performance'],
    'Unreal Engine Developer': ['Unreal', 'C++', 'Tools'],
    Engineer: ['Unity', 'C#', 'Mobile Performance'],
    'Game Artist': ['2D Art', 'Animation', 'Concept'],
    '2D Artist': ['2D Art', 'Animation', 'Concept'],
    '3D Artist': ['3D Modeling', 'Texturing', 'Animation'],
    'Sound Engineer': ['SFX', 'Music', 'Mixing'],
  }
  return map[role] || ['Game Development']
}

function getRoleIcon(role: string) {
  const r = role.toLowerCase()
  const has = (term: string) => r.indexOf(term) !== -1
  if (has('art') || has('design')) return <Palette className="h-6 w-6" />
  if (has('developer') || has('engineer')) return <Code className="h-6 w-6" />
  if (has('juice') || has('vfx') || has('sound')) return <Sparkles className="h-6 w-6" />
  return <Gamepad2 className="h-6 w-6" />
}

export function TeamSection({ teamMembers = [] }: TeamSectionProps) {
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
    <section id="team" className="py-20 bg-secondary/10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <AnimatedSection key={index} delay={index * 0.08} direction="up">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <Card className="group border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-7 text-center">
                    <div className="relative mb-5">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center ring-1 ring-border/40 group-hover:scale-105 transition-transform">
                        <div className="text-primary">{getRoleIcon(member.role)}</div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-1 leading-tight">{member.name}</h3>
                    <p className="text-sm text-primary uppercase tracking-wider font-medium mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{member.bio}</p>

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
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Not hiring right now &mdash; but if our work pulls you, drop a hello at{' '}
            <a
              href="mailto:tech@nexenovastudios.com"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              tech@nexenovastudios.com
            </a>.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
