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
import { AdminLoginPage } from './admin/AdminLoginPage'
import { AdminDashboard } from './admin/AdminDashboard'
import { NotFoundPage } from './NotFoundPage'
import { AnimatedSection } from './AnimatedSection'
import { fetchGames, fetchSiteContent, isAuthenticated, getUserData, initializeDatabase, type Game, type SiteContent } from './admin/DataManager'
import { toast } from 'sonner@2.0.3'

type Route = 'home' | 'game' | 'privacy' | 'terms' | 'cookies' | 'admin-login' | 'admin-dashboard' | 'not-found'

// Функция для плавного скролла в верх страницы
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
  const [games, setGames] = useState<Game[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Эффект для скролла в верх при смене маршрута
  useEffect(() => {
    // Скроллим в верх с небольшой задержкой, чтобы дать время для рендера нового контента
    const timeoutId = setTimeout(() => {
      scrollToTop(true)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [currentRoute, gameId]) // Зависимости: маршрут и ID игры

  useEffect(() => {
    // Проверяем текущий URL при загрузке
    const path = window.location.pathname
    const hash = window.location.hash.slice(1)
    
    if (path === '/admin' || hash === 'admin') {
      // Проверяем авторизацию
      if (isAuthenticated()) {
        setCurrentRoute('admin-dashboard')
        setIsLoggedIn(true)
      } else {
        setCurrentRoute('admin-login')
      }
    } else if (path.startsWith('/game/') || hash.startsWith('game/')) {
      const id = path.startsWith('/game/') ? path.split('/')[2] : hash.split('/')[1]
      if (id) {
        setGameId(id)
        setCurrentRoute('game')
      }
    } else if (path === '/privacy' || hash === 'privacy') {
      setCurrentRoute('privacy')
    } else if (path === '/terms' || hash === 'terms') {
      setCurrentRoute('terms')
    } else if (path === '/cookies' || hash === 'cookies') {
      setCurrentRoute('cookies')
    } else {
      setCurrentRoute('home')
    }

    // Загружаем данные
    loadData()

    // Обработчик изменения URL
    const handlePopState = () => {
      const newPath = window.location.pathname
      const newHash = window.location.hash.slice(1)
      
      if (newPath === '/admin' || newHash === 'admin') {
        if (isAuthenticated()) {
          setCurrentRoute('admin-dashboard')
          setIsLoggedIn(true)
        } else {
          setCurrentRoute('admin-login')
        }
      } else if (newPath.startsWith('/game/') || newHash.startsWith('game/')) {
        const id = newPath.startsWith('/game/') ? newPath.split('/')[2] : newHash.split('/')[1]
        if (id) {
          setGameId(id)
          setCurrentRoute('game')
        }
      } else if (newPath === '/privacy' || newHash === 'privacy') {
        setCurrentRoute('privacy')
      } else if (newPath === '/terms' || newHash === 'terms') {
        setCurrentRoute('terms')
      } else if (newPath === '/cookies' || newHash === 'cookies') {
        setCurrentRoute('cookies')
      } else {
        setCurrentRoute('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Инициализируем базу данных (не блокирующая операция)
      initializeDatabase().catch(error => {
        console.warn('Database initialization failed:', error)
      })
      
      // Загружаем данные (с fallback)
      const [gamesData, contentData] = await Promise.all([
        fetchGames().catch(error => {
          console.error('Failed to fetch games:', error)
          return [] // Fallback будет в fetchGames
        }),
        fetchSiteContent().catch(error => {
          console.error('Failed to fetch site content:', error)
          return null // Fallback будет в fetchSiteContent
        })
      ])

      setGames(gamesData || [])
      setSiteContent(contentData)
    } catch (error) {
      console.error('Error loading data:', error)
      // Не показываем toast ошибку, так как fallback данные должны работать
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

  const navigateToAdmin = () => {
    if (isAuthenticated()) {
      setCurrentRoute('admin-dashboard')
      setIsLoggedIn(true)
    } else {
      setCurrentRoute('admin-login')
    }
    window.history.pushState({}, '', '/admin')
  }

  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true)
    setCurrentRoute('admin-dashboard')
    toast.success(`Welcome back, ${userData.name}!`)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentRoute('admin-login')
    toast.success('Logged out successfully')
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

  // Основной макет с навигацией
  const MainLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      <Navigation 
        onNavigateHome={navigateToHome}
        onNavigateAdmin={navigateToAdmin}
      />
      {children}
    </>
  )

  switch (currentRoute) {
    case 'game':
      const game = games.find(g => g.id === gameId)
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
            relatedGames={games.filter(g => g.id !== gameId).slice(0, 3)}
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

    case 'admin-login':
      return (
        <AdminLoginPage 
          onNavigateHome={navigateToHome}
          onLoginSuccess={handleLoginSuccess}
        />
      )

    case 'admin-dashboard':
      return (
        <AdminDashboard 
          onNavigateHome={navigateToHome}
          onLogout={handleLogout}
        />
      )

    case 'home':
    default:
      // Используем fallback данные если siteContent не загружен
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
          <Navigation 
            onNavigateHome={navigateToHome}
            onNavigateAdmin={navigateToAdmin}
          />
          
          <main>
            <AnimatedSection>
              <HeroSection onGameSelect={navigateToGame} />
            </AnimatedSection>
            
            <AnimatedSection>
              <AboutSection description={defaultContent.companyInfo.description} />
            </AnimatedSection>
            
            <AnimatedSection>
              <ServicesSection onGameSelect={navigateToGame} />
            </AnimatedSection>
            
            <AnimatedSection>
              <PortfolioSection 
                games={games} 
                onGameSelect={navigateToGame}
              />
            </AnimatedSection>
            
            <AnimatedSection>
              <TeamSection teamMembers={defaultContent.teamMembers} />
            </AnimatedSection>
            
            <AnimatedSection>
              <ContactSection 
                companyInfo={defaultContent.companyInfo}
                onNavigateToPrivacy={navigateToPrivacy}
                onNavigateToTerms={navigateToTerms}
                onNavigateToCookies={navigateToCookies}
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