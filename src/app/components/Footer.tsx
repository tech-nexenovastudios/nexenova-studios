import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Youtube } from 'lucide-react'

interface CompanyInfo {
  name: string
  description: string
  email: string
  phone: string
  address: string
}

interface FooterProps {
  companyInfo?: CompanyInfo
  onNavigateToPrivacy?: () => void
  onNavigateToTerms?: () => void
  onNavigateToCookies?: () => void
  onNavigateToCareers?: () => void
}

export function Footer({
  companyInfo,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToCookies,
  onNavigateToCareers
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  const defaultCompanyInfo = companyInfo || {
    name: "Nexenova Studios",
    description: "Crafting memorable mobile gaming experiences for global audiences.",
    email: "support@nexenovastudios.com",
    phone: "",
    address: "India"
  }

  const explore = [
    { label: 'Home', href: '#home' },
    { label: 'The Studio', href: '#about' },
    { label: 'The Pipeline', href: '#services' },
    { label: 'Games', href: '#portfolio' },
    { label: 'Devlog', href: '#devlog' },
    { label: 'Say Hello', href: '#contact' }
  ]

  const games = [
    { label: 'Bird Hunter', href: '#portfolio' },
    { label: 'Smashy Qube', href: '#portfolio' },
    { label: '2048: Striker', href: '#portfolio' },
    { label: 'Echo Loop', href: '#portfolio' },
    { label: 'See all games →', href: '#portfolio' }
  ]

  const scrollToSection = (href: string) => {
    if (href.charAt(0) === '#') {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt=""
                className="h-9 w-9 invert dark:invert-0"
                aria-hidden="true"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  Nexenova
                </span>
                <span className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                  Studios
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Independent mobile games made in India. We make them. You play them.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a 
                  href={`mailto:${defaultCompanyInfo.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {defaultCompanyInfo.email}
                </a>
              </div>
              {defaultCompanyInfo.phone && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${defaultCompanyInfo.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {defaultCompanyInfo.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{defaultCompanyInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              {explore.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {onNavigateToCareers && (
                <li>
                  <button
                    onClick={onNavigateToCareers}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Careers
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Games */}
          <div>
            <h3 className="font-semibold mb-4">Games</h3>
            <ul className="space-y-2">
              {games.map((game, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(game.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {game.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div className="col-span-2 md:col-span-1">
            <div>
              <h3 className="font-semibold mb-4">Follow the studio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Devlogs, soft-launch announcements, and the occasional behind-the-scenes screenshot.
              </p>
              <div className="flex space-x-3">
                <a 
                  href="https://twitter.com/nexenovastudios" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="https://linkedin.com/company/nexenovastudios" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/tech-nexenovastudios"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a 
                  href="https://youtube.com/@nexenovastudios" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} {defaultCompanyInfo.name}. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <button 
                onClick={onNavigateToPrivacy}
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={onNavigateToTerms}
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={onNavigateToCookies}
                className="hover:text-primary transition-colors"
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}