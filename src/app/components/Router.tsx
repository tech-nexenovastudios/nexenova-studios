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
import { fetchSiteContent, initializeDatabase, type Game, type SiteContent } from '../data/dataManager'
import gamesSeed from '../data/games.seed.json'
import {
  applySeo,
  careersIndexSeo,
  cookiesSeo,
  deleteAccountSeo,
  devlogIndexSeo,
  gameNotFoundSeo,
  gameSeo,
  homeSeo,
  notFoundSeo,
  privacySeo,
  termsSeo,
} from '../utils/seo'

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
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)

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

  // Per-route SEO for the routes Router can resolve synchronously. devlog-post
  // and career-detail are deliberately absent: their content is fetched by the
  // child component, which owns their SEO end to end. (A placeholder here used
  // to race the child — React runs child effects first on mount, so the
  // parent's generic title could land last on first paint.)
  useEffect(() => {
    switch (currentRoute) {
      case 'game': {
        const game = seedGames.find((g) => g.id === gameId)
        applySeo(game ? gameSeo(game) : gameNotFoundSeo(gameId))
        break
      }
      case 'devlog':
        applySeo(devlogIndexSeo())
        break
      case 'careers':
        applySeo(careersIndexSeo())
        break
      case 'privacy':
        applySeo(privacySeo())
        break
      case 'terms':
        applySeo(termsSeo())
        break
      case 'cookies':
        applySeo(cookiesSeo())
        break
      case 'delete-account':
        applySeo(deleteAccountSeo())
        break
      case 'not-found':
        applySeo(notFoundSeo(window.location.pathname))
        break
      case 'devlog-post':
      case 'career-detail':
        break
      case 'home':
      default:
        applySeo(homeSeo())
    }
  }, [currentRoute, gameId, postSlug, careerSlug])

  // Site content is an enhancement, not a prerequisite: every route renders
  // immediately from the bundled seed data and swaps in the Supabase copy when
  // it arrives. Blocking the first paint on this round-trip used to gate LCP —
  // on every route, including static legal pages — behind a third-party call.
  const loadData = async () => {
    initializeDatabase().catch(error => {
      console.warn('Database initialization failed:', error)
    })

    const contentData = await fetchSiteContent().catch(error => {
      console.error('Failed to fetch site content:', error)
      return null
    })

    if (contentData) setSiteContent(contentData)
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