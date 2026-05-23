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
}

export function Footer({ 
  companyInfo,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToCookies
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  const defaultCompanyInfo = companyInfo || {
    name: "Nexenova Studios",
    description: "Crafting memorable mobile gaming experiences for global audiences.",
    email: "support@nexenovastudios.com",
    phone: "",
    address: "India"
  }

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' }
  ]

  const services = [
    { label: 'Mobile Game Development', href: '#services' },
    { label: 'Puzzle & Casual Games', href: '#services' },
    { label: 'Game Art & Design', href: '#services' },
    { label: 'Live-Ops & Publishing', href: '#services' }
  ]

  const resources = [
    { label: 'Blog', href: '#' },
    { label: 'Case Studies', href: '#' },
    { label: 'Game Development Tips', href: '#' },
    { label: 'Industry News', href: '#' }
  ]

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt=""
                className="h-9 w-9"
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
              {defaultCompanyInfo.description} From concept to release, we bring your game vision to life.
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

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(service.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {service.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Social */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 mb-6">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
            
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
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