import { useState, useEffect, lazy, Suspense } from 'react'
import { HeroSection } from './HeroSection'
import { AboutSection } from './AboutSection'
import { ServicesSection } from './ServicesSection'
import { PortfolioSection } from './PortfolioSection'
import { TeamSection } from './TeamSection'
import { ContactSection } from './ContactSection'
import { Footer } from './Footer'
import { Navigation } from './Navigation'
import { DevlogSection } from './DevlogSection'
import { AnimatedSection } from './AnimatedSection'

// Secondary routes are code-split: their bundles load only when visited,
// keeping the landing-page payload small. Home-page sections above stay eager.
const GamePage = lazy(() => import('./games/GamePage').then(m => ({ default: m.GamePage })))
const PrivacyPolicyPage = lazy(() => import('./legal/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const TermsOfServicePage = lazy(() => import('./legal/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })))
const CookiePolicyPage = lazy(() => import('./legal/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })))
const DeleteAccountPage = lazy(() => import('./legal/DeleteAccountPage').then(m => ({ default: m.DeleteAccountPage })))
const DevlogIndexPage = lazy(() => import('./devlog/DevlogIndexPage').then(m => ({ default: m.DevlogIndexPage })))
const DevlogPostPage = lazy(() => import('./devlog/DevlogPostPage').then(m => ({ default: m.DevlogPostPage })))
const CareersIndexPage = lazy(() => import('./careers/CareersIndexPage').then(m => ({ default: m.CareersIndexPage })))
const CareerDetailPage = lazy(() => import('./careers/CareerDetailPage').then(m => ({ default: m.CareerDetailPage })))
const NotFoundPage = lazy(() => import('./NotFoundPage').then(m => ({ default: m.NotFoundPage })))
import { fetchGames, fetchSiteContent, initializeDatabase, type Game, type SiteContent } from '../data/dataManager'
import gamesSeed from '../data/games.seed.json'
import { applySeo, clip, organizationLd, websiteLd, videoGameLd, SITE_NAME } from '../utils/seo'

const HOME_TITLE = 'Nexenova Studios — AI-Powered Indie Mobile Game Studio'
const HOME_DESCRIPTION =
  'Nexenova Studios is an indie mobile game studio in India using AI and rapid prototyping to build and ship puzzle, casual, arcade, and action games worldwide.'

const seedGames = gamesSeed as Game[]

type Route = 'home' | 'game' | 'privacy' | 'terms' | 'cookies' | 'delete-account' | 'devlog' | 'devlog-post' | 'careers' | 'career-detail' | 'not-found'

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}

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
  const [careerSlug, setCareerSlug] = useState<string>('')
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
      // Normalize a trailing slash (except the root) so "/careers/" resolves the
      // same as "/careers" instead of falling through to the 404 route.
      const rawPath = window.location.pathname
      const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath
      const hash = window.location.hash.slice(1)

      if (path.indexOf('/game/') === 0 || hash.indexOf('game/') === 0) {
        const id =
          path.indexOf('/game/') === 0 ? path.split('/')[2] : hash.split('/')[1]
        if (id) {
          setGameId(id)
          setCurrentRoute('game')
        } else {
          setCurrentRoute('not-found')
        }
      } else if (path.indexOf('/devlog/') === 0 || hash.indexOf('devlog/') === 0) {
        const slug =
          path.indexOf('/devlog/') === 0 ? path.split('/')[2] : hash.split('/')[1]
        if (slug) {
          setPostSlug(slug)
          setCurrentRoute('devlog-post')
        } else {
          setCurrentRoute('not-found')
        }
      } else if (path === '/devlog' || hash === 'devlog') {
        setCurrentRoute('devlog')
      } else if (path.indexOf('/careers/') === 0 || hash.indexOf('careers/') === 0) {
        const slug =
          path.indexOf('/careers/') === 0 ? path.split('/')[2] : hash.split('/')[1]
        if (slug) {
          setCareerSlug(slug)
          setCurrentRoute('career-detail')
        } else {
          setCurrentRoute('not-found')
        }
      } else if (path === '/careers' || hash === 'careers') {
        setCurrentRoute('careers')
      } else if (path === '/privacy' || hash === 'privacy') {
        setCurrentRoute('privacy')
      } else if (path === '/terms' || hash === 'terms') {
        setCurrentRoute('terms')
      } else if (path === '/cookies' || hash === 'cookies') {
        setCurrentRoute('cookies')
      } else if (path === '/delete-account' || hash === 'delete-account') {
        setCurrentRoute('delete-account')
      } else if (path === '/' || path === '') {
        // Root path (plus any homepage anchor like /#about or /#home) is home.
        setCurrentRoute('home')
      } else {
        // Unknown URL — render the 404 page (noindex) instead of silently
        // serving homepage content, which Google treats as a soft 404 /
        // duplicate content.
        setCurrentRoute('not-found')
      }
    }

    applyRouteFromUrl()
    loadData()

    window.addEventListener('popstate', applyRouteFromUrl)
    return () => window.removeEventListener('popstate', applyRouteFromUrl)
  }, [])

  // Per-route SEO for routes Router can resolve synchronously. The devlog-post
  // and career-detail pages set their own SEO once their content loads; here we
  // apply an immediate placeholder so the tab/canonical aren't stale mid-load.
  useEffect(() => {
    switch (currentRoute) {
      case 'game': {
        const game = seedGames.find((g) => g.id === gameId)
        if (game) {
          applySeo({
            title: `${game.title} — ${game.genre} Mobile Game | ${SITE_NAME}`,
            description: clip(game.description),
            path: `/game/${game.id}`,
            image: game.image,
            jsonLd: videoGameLd(game),
          })
        } else {
          applySeo({
            title: `Game Not Found | ${SITE_NAME}`,
            description: HOME_DESCRIPTION,
            path: `/game/${gameId}`,
            robots: 'noindex,follow',
          })
        }
        break
      }
      case 'devlog':
        applySeo({
          title: `Devlog — Behind Our Mobile Games | ${SITE_NAME}`,
          description:
            'Development updates, design deep-dives, and behind-the-scenes notes from the Nexenova Studios game team.',
          path: '/devlog',
        })
        break
      case 'devlog-post':
        applySeo({
          title: `Devlog | ${SITE_NAME}`,
          description: 'A development update from the Nexenova Studios team.',
          path: `/devlog/${postSlug}`,
          type: 'article',
        })
        break
      case 'careers':
        applySeo({
          title: `Careers — Build Mobile Games With Us | ${SITE_NAME}`,
          description:
            'Open roles at Nexenova Studios. Join an independent mobile game studio shipping puzzle, casual, and arcade titles worldwide.',
          path: '/careers',
        })
        break
      case 'career-detail':
        applySeo({
          title: `Careers | ${SITE_NAME}`,
          description: 'An open role at Nexenova Studios.',
          path: `/careers/${careerSlug}`,
        })
        break
      case 'privacy':
        applySeo({
          title: `Privacy Policy | ${SITE_NAME}`,
          description: 'How Nexenova Studios collects, uses, and protects your data.',
          path: '/privacy',
        })
        break
      case 'terms':
        applySeo({
          title: `Terms of Service | ${SITE_NAME}`,
          description: 'The terms governing use of the Nexenova Studios website and games.',
          path: '/terms',
        })
        break
      case 'cookies':
        applySeo({
          title: `Cookie Policy | ${SITE_NAME}`,
          description: 'How Nexenova Studios uses cookies and similar technologies.',
          path: '/cookies',
        })
        break
      case 'delete-account':
        applySeo({
          title: `Delete Your Account | ${SITE_NAME}`,
          description:
            'Request permanent deletion of your Nexenova Studios game account and associated data. No app install required.',
          path: '/delete-account',
          robots: 'noindex,follow',
        })
        break
      case 'not-found':
        applySeo({
          title: `Page Not Found | ${SITE_NAME}`,
          description: HOME_DESCRIPTION,
          path: window.location.pathname,
          robots: 'noindex,follow',
        })
        break
      case 'home':
      default:
        applySeo({
          title: HOME_TITLE,
          description: HOME_DESCRIPTION,
          path: '/',
          jsonLd: [organizationLd(), websiteLd()],
        })
    }
  }, [currentRoute, gameId, postSlug, careerSlug])

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

  const navigateToDeleteAccount = () => {
    setCurrentRoute('delete-account')
    window.history.pushState({}, '', '/delete-account')
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

  const navigateToCareers = () => {
    setCurrentRoute('careers')
    window.history.pushState({}, '', '/careers')
  }

  const navigateToCareer = (slug: string) => {
    setCareerSlug(slug)
    setCurrentRoute('career-detail')
    window.history.pushState({}, '', `/careers/${slug}`)
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
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
      <Footer
        companyInfo={siteContent?.companyInfo}
        onNavigateToPrivacy={navigateToPrivacy}
        onNavigateToTerms={navigateToTerms}
        onNavigateToCookies={navigateToCookies}
        onNavigateToCareers={navigateToCareers}
        onNavigateToDeleteAccount={navigateToDeleteAccount}
      />
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

    case 'delete-account':
      return (
        <MainLayout>
          <DeleteAccountPage onNavigateHome={navigateToHome} />
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

    case 'careers':
      return (
        <MainLayout>
          <CareersIndexPage
            onNavigateHome={navigateToHome}
            onNavigateToRole={navigateToCareer}
          />
        </MainLayout>
      )

    case 'career-detail':
      return (
        <MainLayout>
          <CareerDetailPage
            slug={careerSlug}
            onNavigateHome={navigateToHome}
            onNavigateToCareers={navigateToCareers}
          />
        </MainLayout>
      )

    case 'not-found':
      return (
        <MainLayout>
          <NotFoundPage onNavigateHome={navigateToHome} />
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
        // teamMembers intentionally omitted — when siteContent is null, the
        // TeamSection falls back to its own role-based card set instead of
        // these generic placeholders.
        teamMembers: [],
        companyInfo: {
          name: "Nexenova Studios",
          description: "Independent mobile game studio crafting puzzle and action titles for global audiences.",
          email: "tech@nexenovastudios.com",
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
              <TeamSection
                teamMembers={siteContent?.teamMembers}
                onNavigateToCareers={navigateToCareers}
              />
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
            onNavigateToCareers={navigateToCareers}
            onNavigateToDeleteAccount={navigateToDeleteAccount}
          />
        </>
      )
  }
}