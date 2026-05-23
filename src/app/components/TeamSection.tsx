import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Github, Linkedin, Twitter, Code, Gamepad2 } from 'lucide-react'

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

export function TeamSection({ teamMembers = [] }: TeamSectionProps) {
  // Transform team data and add default skills/social
  const team = teamMembers.length > 0 ? teamMembers.map(member => ({
    name: member.name,
    role: member.role,
    bio: member.bio,
    skills: getSkillsForRole(member.role),
    social: {
      github: '#',
      linkedin: '#',
      twitter: '#'
    }
  })) : [
    {
      name: 'Vereshchagin Nikita',
      role: 'CEO',
      bio: 'Visionary leader driving innovation and strategic growth in game development',
      skills: ['Leadership', 'Strategy', 'Business Development'],
      social: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Karmyshev Iskender',
      role: 'CEO',
      bio: 'Co-founder focused on operational excellence and team development',
      skills: ['Management', 'Operations', 'Team Building'],
      social: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Denis Orzjehovsky',
      role: 'Unreal Engine Developer',
      bio: 'Expert in Unreal Engine development creating immersive gaming experiences',
      skills: ['Unreal Engine', 'C++', 'Game Programming'],
      social: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      }
    }
  ]

  function getSkillsForRole(role: string): string[] {
    const roleSkills: Record<string, string[]> = {
      'CEO': ['Leadership', 'Strategy', 'Business Development'],
      'Unreal Engine Developer': ['Unreal Engine', 'C++', 'Game Programming'],
      'Lead Developer': ['Game Development', 'Unity', 'C#'],
      'Game Designer': ['Game Design', 'UX/UI', 'Prototyping'],
      '3D Artist': ['3D Modeling', 'Texturing', 'Animation']
    }
    return roleSkills[role] || ['Game Development']
  }

  function getRoleIcon(role: string) {
    if (role.toLowerCase().includes('developer') || role.toLowerCase().includes('engine')) {
      return <Code className="h-6 w-6" />
    }
    return <Gamepad2 className="h-6 w-6" />
  }

  return (
    <section id="team" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our diverse team of passionate creators brings together years of experience 
            in game development, art, design, and technology to craft exceptional gaming experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
              <Card key={index} className="group border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all group-hover:from-primary/30 group-hover:to-primary/50">
                    <div className="text-primary group-hover:text-primary-foreground transition-colors">
                      {getRoleIcon(member.role)}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {member.skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-center space-x-3">
                  {member.social.github && (
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <Github className="h-4 w-4" />
                    </button>
                  )}
                  {member.social.linkedin && (
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </button>
                  )}
                  {member.social.twitter && (
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <Twitter className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
              </Card>
            ))
        }
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented individuals who share our passion for creating amazing games.
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              View Open Positions
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}