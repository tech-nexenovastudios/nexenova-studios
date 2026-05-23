import { useState, useEffect } from 'react'
import { HeroSection } from './HeroSection'
import { AboutSection } from './AboutSection'
import { ServicesSection } from './ServicesSection'
import { PortfolioSection } from './PortfolioSection'
import { TeamSection } from './TeamSection'
import { ContactSection } from './ContactSection'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { GamePage } from './games/GamePage'
import { PrivacyPolicyPage } from './legal/PrivacyPolicyPage'
import { TermsOfServicePage } from './legal/TermsOfServicePage'
import { CookiePolicyPage } from './legal/CookiePolicyPage'
import { DevlogIndexPage } from './devlog/DevlogIndexPage'
import { DevlogPostPage } from './devlog/DevlogPostPage'
import { DevlogSection } from './DevlogSection'
import { NotFoundPage } from './NotFoundPage'
import { AnimatedSection } from './AnimatedSection'
import { fetchGames, fetchSiteContent, initializeDatabase, type Game, type SiteContent } from '../data/dataManager'
import gamesSeed from '../data/games.seed.json'

const seedGames = gamesSeed as Game[]

type Route = 'home' | 'game' | 'privacy' | 'terms' | 'cookies' | 'devlog' | 'devlog-post' | 'not-found'

const scrollToTop = (smooth: boolean = true) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home')
  const [gameId, setGameId] = useState<string>('')
  const [postSlug, setPostSlug] = useState<string>('')
  const [games, setGames] = useState<Game[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToTop(true)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [currentRoute, gameId])

  useEffect(() => {
    const applyRouteFromUrl = () => {
      const path = window.location.pathname
      const hash = window.location.hash.slice(1)

      if (path.indexOf('/game/') === 0 || hash.indexOf('game/') === 0) {
        const id =
          path.indexOf('/game/') === 0 ? path.split('/')[2] : hash.split('/')[1]
        if (id) {
          setGameId(id)
          setCurrentRoute('game')
        }
      } else if (path.indexOf('/devlog/') === 0 || hash.indexOf('devlog/') === 0) {
        const slug =
          path.indexOf('/devlog/') === 0 ? path.split('/')[2] : hash.split('/')[1]
        if (slug) {
          setPostSlug(slug)
          setCurrentRoute('devlog-post')
        }
      } else if (path === '/devlog' || hash === 'devlog') {
        setCurrentRoute('devlog')
      } else if (path === '/privacy' || hash === 'privacy') {
        setCurrentRoute('privacy')
      } else if (path === '/terms' || hash === 'terms') {
        setCurrentRoute('terms')
      } else if (path === '/cookies' || hash === 'cookies') {
        setCurrentRoute('cookies')
      } else {
        setCurrentRoute('home')
      }
    }

    applyRouteFromUrl()
    loadData()

    window.addEventListener('popstate', applyRouteFromUrl)
    return () => window.removeEventListener('popstate', applyRouteFromUrl)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      initializeDatabase().catch(error => {
        console.warn('Database initialization failed:', error)
      })
      
      const [gamesData, contentData] = await Promise.all([
        fetchGames().catch(error => {
          console.error('Failed to fetch games:', error)
          return []
        }),
        fetchSiteContent().catch(error => {
          console.error('Failed to fetch site content:', error)
          return null
        })
      ])

      setGames(gamesData || [])
      setSiteContent(contentData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToHome = () => {
    setCurrentRoute('home')
    window.history.pushState({}, '', '/')
  }

  const navigateToGame = (id: string) => {
    setGameId(id)
    setCurrentRoute('game')
    window.history.pushState({}, '', `/game/${id}`)
  }

  const navigateToPrivacy = () => {
    setCurrentRoute('privacy')
    window.history.pushState({}, '', '/privacy')
  }

  const navigateToTerms = () => {
    setCurrentRoute('terms')
    window.history.pushState({}, '', '/terms')
  }

  const navigateToCookies = () => {
    setCurrentRoute('cookies')
    window.history.pushState({}, '', '/cookies')
  }

  const navigateToDevlog = () => {
    setCurrentRoute('devlog')
    window.history.pushState({}, '', '/devlog')
  }

  const navigateToDevlogPost = (slug: string) => {
    setPostSlug(slug)
    setCurrentRoute('devlog-post')
    window.history.pushState({}, '', `/devlog/${slug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const MainLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      <Navigation onNavigateHome={navigateToHome} />
      {children}
    </>
  )

  switch (currentRoute) {
    case 'game':
      const game = seedGames.find(g => g.id === gameId)
      if (!game) {
        return (
          <MainLayout>
            <NotFoundPage onNavigateHome={navigateToHome} />
          </MainLayout>
        )
      }
      return (
        <MainLayout>
          <GamePage
            game={game}
            onNavigateHome={navigateToHome}
            onNavigateToGame={navigateToGame}
            relatedGames={seedGames.filter(g => g.id !== gameId).slice(0, 3)}
          />
        </MainLayout>
      )

    case 'privacy':
      return (
        <MainLayout>
          <PrivacyPolicyPage onNavigateHome={navigateToHome} />
        </MainLayout>
      )

    case 'terms':
      return (
        <MainLayout>
          <TermsOfServicePage onNavigateHome={navigateToHome} />
        </MainLayout>
      )

    case 'cookies':
      return (
        <MainLayout>
          <CookiePolicyPage onNavigateHome={navigateToHome} />
        </MainLayout>
      )

    case 'devlog':
      return (
        <MainLayout>
          <DevlogIndexPage
            onNavigateHome={navigateToHome}
            onNavigateToPost={navigateToDevlogPost}
          />
        </MainLayout>
      )

    case 'devlog-post':
      return (
        <MainLayout>
          <DevlogPostPage
            slug={postSlug}
            onNavigateHome={navigateToHome}
            onNavigateToDevlog={navigateToDevlog}
          />
        </MainLayout>
      )

    case 'home':
    default:
      const defaultContent = siteContent || {
        heroStats: {
          gamesPublished: 7,
          yearsExperience: 3,
          happyClients: 100,
          downloads: 100000
        },
        teamMembers: [
          {
            id: 1,
            name: "Lead Developer",
            role: "Engineering",
            bio: "Driving the technical vision behind our mobile games and live-ops."
          },
          {
            id: 2,
            name: "Game Designer",
            role: "Design",
            bio: "Designing core gameplay loops across our puzzle, casual, and arcade titles."
          },
          {
            id: 3,
            name: "2D Artist",
            role: "Art & Animation",
            bio: "Creating the look and feel of every Nexenova Studios title."
          }
        ],
        companyInfo: {
          name: "Nexenova Studios",
          description: "We are a passionate team of mobile game developers dedicated to crafting memorable gaming experiences.",
          email: "support@nexenovastudios.com",
          phone: "",
          address: "India"
        }
      }

      return (
        <>
          <Navigation onNavigateHome={navigateToHome} />
          
          <main>
            <AnimatedSection>
              <HeroSection onGameSelect={navigateToGame} />
            </AnimatedSection>
            
            <AnimatedSection>
              <AboutSection />
            </AnimatedSection>
            
            <AnimatedSection>
              <ServicesSection onGameSelect={navigateToGame} />
            </AnimatedSection>
            
            <AnimatedSection>
              <PortfolioSection onGameSelect={navigateToGame} />
            </AnimatedSection>
            
            <AnimatedSection>
              <TeamSection teamMembers={defaultContent.teamMembers} />
            </AnimatedSection>

            <AnimatedSection>
              <DevlogSection
                onNavigateToDevlog={navigateToDevlog}
                onNavigateToPost={navigateToDevlogPost}
              />
            </AnimatedSection>

            <AnimatedSection>
              <ContactSection
                companyInfo={defaultContent.companyInfo}
                onNavigateToPrivacy={navigateToPrivacy}
                onNavigateToTerms={navigateToTerms}
              />
            </AnimatedSection>
          </main>
          
          <Footer 
            companyInfo={defaultContent.companyInfo}
            onNavigateToPrivacy={navigateToPrivacy}
            onNavigateToTerms={navigateToTerms}
            onNavigateToCookies={navigateToCookies}
          />
        </>
      )
  }
}