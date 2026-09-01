import { motion } from 'motion/react'
import { Github, Linkedin } from 'lucide-react'
import { XIcon } from './icons/XIcon'
import { AppLink } from './AppLink'
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
  /** Titles credited on the card. */
  shipped?: string[]
  /** How that credit reads — sole authorship vs contribution. */
  creditLabel?: string
  social: { github?: string; linkedin?: string; x?: string }
}

/**
 * Extra detail we hold beyond what the CMS record carries — credits, links and
 * a fuller bio. Keyed by the name in the database and merged over that record,
 * so each person keeps their place in the roster.
 *
 * Bio text comes from Prabhat's public LinkedIn profile. The phone number and
 * private email on that CV are deliberately not reproduced: this is a public
 * page, and the contact form is the route in.
 */
const PROFILES: Record<string, Partial<TeamCard> & { shipped?: string[] }> = {
  'Prabhat Kumar': {
    bio: 'Owns the full production stack solo — gameplay in C#, meta systems, and live-ops on Unity Gaming Services.',
    skills: ['Unity', 'C#', 'Live-Ops', 'Unity IAP'],
    shipped: ['No Limit Arena', 'Twisty Snake', 'Big Brain', 'Sweet Tumble'],
    creditLabel: 'Built solo',
    social: { linkedin: 'https://www.linkedin.com/in/prabhatkumar5071/' },
  },
  'Ashutosh Kushwah': {
    bio: 'Unity and C# developer focused on gameplay mechanics, AI behaviour, and keeping builds fast across every device tier.',
    skills: ['Unity', 'C#', 'Gameplay AI'],
    shipped: ['Smashy Qube', 'Last Turn'],
    creditLabel: 'Worked on',
    // LinkedIn slug is redacted on the CV (…707399xxxx) — needs the real URL.
    social: {},
  },
}

const FALLBACK_TEAM: TeamCard[] = [
  {
    name: 'Founder & Game Designer',
    role: 'Designs the loops',
    bio: "Sketches mechanics on napkins, plays them obsessively, kills the ones that don't click within sixty seconds.",
    skills: ['Game Design', 'Level Design', 'Pitching'],
    social: {},
  },
  {
    name: 'Engineering Lead',
    role: 'Builds it',
    bio: 'Turns prototype sketches into 60-fps reality. Lives in Unity. Has strong opinions about input latency.',
    skills: ['Unity', 'C#', 'Mobile Performance'],
    social: {},
  },
  {
    name: 'Art & Juice',
    role: 'Makes it feel good',
    bio: 'Shaders, screen-shake, that little particle burst when something clicks. The polish you feel before you see.',
    skills: ['2D Art', 'VFX', 'Animation'],
    social: {},
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

/** GitHub is only meaningful on an engineering profile — artists, designers
 *  and QA get LinkedIn and X instead. */
function isEngineeringRole(role: string): boolean {
  const r = role.toLowerCase()
  return ['developer', 'engineer', 'engineering', 'technical', 'programmer'].some(t => r.includes(t))
}

/**
 * Discipline sets each card's block colour and tag. These are the L=.78 brand
 * pastels used as BACKGROUNDS behind ink-stroked lettering, so they stay
 * fixed rather than following the light/dark accent tokens.
 */
function disciplineOf(role: string): { label: string; color: string } {
  const r = role.toLowerCase()
  if (/qa|test/.test(r)) return { label: 'QA', color: '#ff8f87' }
  if (/developer|engineer|technical|programmer/.test(r)) return { label: 'ENGINEERING', color: '#00cef3' }
  if (/art|animator|design/.test(r)) return { label: 'ART', color: '#c5a1ff' }
  return { label: 'PRODUCTION', color: '#95b1ff' }
}

/** Two-letter monogram; the portrait stand-in on every card. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name.slice(0, 2).toUpperCase()
}

export function TeamSection({ teamMembers = [], onNavigateToCareers }: TeamSectionProps) {
  const team: TeamCard[] =
    teamMembers.length > 0
      ? teamMembers.map((m) => {
          const extra = PROFILES[m.name] ?? {}
          return {
            name: m.name,
            role: m.role,
            bio: m.bio,
            skills: getSkillsForRole(m.role),
            social: {},
            ...extra,
          } as TeamCard
        })
      : FALLBACK_TEAM

  const roster: TeamCard[] = team

  return (
    <section id="team" className="section-team py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="section-eyebrow mb-4 inline-block"
          >
            The Team
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight"
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
          <CarouselContent className="-ml-4 items-stretch">
            {roster.map((member, index) => (
              <CarouselItem
                key={index}
                className="flex pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  whileHover={{ y: -6, rotate: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-full"
                  style={{ rotate: `${[-1.6, 1.1, -0.7, 1.4, -1.1][index % 5]}deg` }}
                >
                  <div
                    className="flex w-full flex-col overflow-hidden rounded-[5px] border-4 border-[var(--ink)] bg-[var(--cream)]"
                    style={{ boxShadow: `8px 8px 0 ${disciplineOf(member.role).color}` }}
                  >

                    {/* Portrait block — monogram over halftone and a burst */}
                    <div
                      className="relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden border-b-4 border-[var(--ink)]"
                      style={{ backgroundColor: disciplineOf(member.role).color }}
                    >
                      <div className="ink-halftone absolute inset-0" />
                      <div className="ink-burst absolute h-[260px] w-[260px] rounded-full opacity-50" />
                      <span
                        className="relative text-[74px] leading-none tracking-[0.02em] text-[var(--cream)]"
                        style={{ fontFamily: "'Bungee', cursive", WebkitTextStroke: '4px var(--ink)' }}
                      >
                        {initialsOf(member.name)}
                      </span>
                      <span
                        className="absolute left-3 top-3 -rotate-3 bg-[var(--ink)] px-2.5 py-1 text-[10px] tracking-[0.1em] text-[var(--cream)]"
                        style={{ fontFamily: "'Bungee', cursive" }}
                      >
                        {disciplineOf(member.role).label}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4 text-left">
                      <span className="text-[19px] leading-tight text-[var(--ink)]" style={{ fontFamily: "'Bungee', cursive" }}>
                        {member.name}
                      </span>

                      <span className="mt-2 self-start rounded-full border-[2.5px] border-[var(--ink)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--ink)]">
                        {member.role}
                      </span>

                      {member.shipped && (
                        <p className="mt-3 text-[11px] leading-relaxed text-[var(--ink)]/75">
                          <span style={{ fontFamily: "'Bungee', cursive" }} className="text-[10px]">{member.creditLabel ?? 'Credits'}&nbsp;</span>
                          {member.shipped.join(' · ')}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="text-[11px] font-semibold text-[var(--ink)]/70">
                          {member.skills.slice(0, 2).join(' · ')}
                        </span>
                        <span className="flex gap-1.5">
                          {([
                            // GitHub stays on engineering profiles only.
                            member.social.github && isEngineeringRole(member.role)
                              ? { href: member.social.github, label: 'GitHub', Icon: Github }
                              : null,
                            member.social.linkedin
                              ? { href: member.social.linkedin, label: 'LinkedIn', Icon: Linkedin }
                              : null,
                            member.social.x ? { href: member.social.x, label: 'X', Icon: XIcon } : null,
                          ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[])
                            .filter(l => l.href !== '#')
                            .map(({ href, label, Icon }) => (
                              <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${member.name} on ${label}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-[var(--ink)] bg-white text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--cream)]"
                              >
                                <Icon className="h-4 w-4" />
                              </a>
                            ))}
                        </span>
                      </div>
                    </div>
                  </div>
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
              <AppLink href="/careers" onNavigate={onNavigateToCareers}
                className="font-medium text-[var(--section-accent)] hover:underline underline-offset-4"
              >
                See open roles &rarr;
              </AppLink>
            ) : (
              <a
                href="/careers"
                className="font-medium text-[var(--section-accent)] hover:underline underline-offset-4"
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
