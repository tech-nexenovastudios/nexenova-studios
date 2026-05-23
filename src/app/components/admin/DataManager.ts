import { projectId, publicAnonKey } from '../../utils/supabase/info'

// Типы данных
export interface Game {
  id: string
  title: string
  description: string
  fullDescription: string
  image: string
  screenshots: string[]
  tags: string[]
  genre: string
  platform: string[]
  status: string
  rating: number
  downloads: string
  releaseDate: string
  videoUrl?: string
  steamUrl?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface SiteContent {
  heroStats: {
    gamesPublished: number
    yearsExperience: number
    happyClients: number
    downloads: number
  }
  teamMembers: Array<{
    id: number
    name: string
    role: string
    image: string
    bio: string
  }>
  companyInfo: {
    name: string
    description: string
    email: string
    phone: string
    address: string
  }
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isActive: boolean
}

export interface AuditLogEntry {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: any
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

// Утилиты для работы с токеном
export function getAuthToken(): string {
  return localStorage.getItem('authToken') || ''
}

export function getUserData(): User | null {
  const userData = localStorage.getItem('userData')
  return userData ? JSON.parse(userData) : null
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export function logout(): void {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userData')
}

// Базовая функция для API запросов
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  }

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d${endpoint}`, config)
  
  if (response.status === 401) {
    // Токен истек или недействителен
    logout()
    throw new Error('Authentication required')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }
  
  return result.data
}

// API функции для аутентификации
export async function loginUser(email: string, password: string) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ email, password })
  })

  return response.json()
}

export async function logoutUser() {
  try {
    const token = getAuthToken()
    if (token) {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    logout()
  }
}

// Fallback данные для игр
const now = new Date().toISOString()

const fallbackGames: Game[] = [
  {
    id: "pirate-tile-clash",
    title: "Pirate Tile-Clash",
    description: "Clash tiles in a swashbuckling pirate-themed puzzle adventure.",
    fullDescription: "Pirate Tile-Clash is an exciting puzzle game where you match and clash tiles in a pirate-themed adventure. Strategize your moves, chain combos, and unlock new challenges as you sail through engaging levels.\n\nDesigned for short sessions and lazy afternoons alike, the game balances quick play with deep strategy. Match more, chain more, and become the most feared tile-clasher on the seven seas.",
    image: "https://images.unsplash.com/photo-1633545495735-25df17fb9f31?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1633545495735-25df17fb9f31?w=800&h=450&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Puzzle", "Casual"],
    genre: "Puzzle",
    platform: ["Android", "iOS"],
    status: "Released",
    rating: 4.4,
    downloads: "50K+",
    releaseDate: "2023-08-15T00:00:00.000Z",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  },
  {
    id: "2048-no-limit",
    title: "2048 No Limit",
    description: "A captivating puzzle game where the numbers never stop climbing.",
    fullDescription: "2048 No Limit is a captivating endless puzzle game that will keep you hooked for hours. Combine matching tiles to reach ever higher numbers — there is no cap, only your skill.\n\nWith smooth one-handed controls and undo support, every session feels effortless. Chase your personal best, share your highest tile, and discover just how far you can go.",
    image: "https://images.unsplash.com/photo-1612296727716-30bb6e3fa83a?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1612296727716-30bb6e3fa83a?w=800&h=450&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Puzzle", "Numbers"],
    genre: "Puzzle",
    platform: ["Android", "iOS"],
    status: "Released",
    rating: 4.5,
    downloads: "100K+",
    releaseDate: "2023-04-20T00:00:00.000Z",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  },
  {
    id: "bird-hunter",
    title: "Bird Hunter",
    description: "Track and hunt birds across breathtaking environments.",
    fullDescription: "Embark on an epic adventure with Bird Hunter. Track and hunt birds in a variety of environments — from misty forests to open plains — with realistic gameplay mechanics and satisfying progression.\n\nMaster a range of tools and tactics, unlock new locations, and complete challenge missions to become the ultimate marksman. Perfect for adventure fans looking for short, rewarding sessions.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=450&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Adventure", "Action"],
    genre: "Adventure",
    platform: ["Android", "iOS"],
    status: "Released",
    rating: 4.2,
    downloads: "25K+",
    releaseDate: "2023-11-05T00:00:00.000Z",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  },
  {
    id: "jump-on",
    title: "Jump On",
    description: "Jump through challenging platforms in a fast-paced arcade test of reflexes.",
    fullDescription: "Jump On is a fast-paced arcade game that tests your reflexes and timing. Leap from platform to platform, dodge obstacles, and chain perfect jumps to climb the leaderboard.\n\nWith pick-up-and-play controls and a constantly escalating difficulty curve, Jump On is built for one-more-run sessions that turn into hours.",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Arcade", "Casual"],
    genre: "Arcade",
    platform: ["Android", "iOS"],
    status: "Released",
    rating: 4.3,
    downloads: "40K+",
    releaseDate: "2024-02-14T00:00:00.000Z",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  },
  {
    id: "feed-the-cat",
    title: "Feed the Cat",
    description: "A delightful casual game where you care for adorable cats.",
    fullDescription: "Feed the Cat is a delightful casual game where you feed and care for adorable cats. Enjoy relaxing gameplay with charming graphics, cozy music, and a steady stream of new friends to adopt.\n\nPerfect for unwinding after a long day, with quick sessions and a warm, low-pressure loop.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=450&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Casual", "Cozy"],
    genre: "Casual",
    platform: ["Android", "iOS"],
    status: "Released",
    rating: 4.6,
    downloads: "60K+",
    releaseDate: "2024-05-22T00:00:00.000Z",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  },
  {
    id: "ripple-delete",
    title: "Ripple Delete",
    description: "A unique puzzle game where deleting tiles creates satisfying ripple effects.",
    fullDescription: "Ripple Delete is a unique puzzle game where you strategically delete tiles to trigger satisfying ripple effects across the board. Plan your chain reactions, clear challenging levels, and discover increasingly clever mechanics as you progress.\n\nComing soon — wishlist now to be the first to play.",
    image: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Puzzle", "Coming Soon"],
    genre: "Puzzle",
    platform: ["Android", "iOS"],
    status: "Coming Soon",
    rating: 0,
    downloads: "—",
    releaseDate: "",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  },
  {
    id: "pirates-royale",
    title: "Pirates Royale",
    description: "A thrilling multiplayer pirate brawler — battle for treasure and glory.",
    fullDescription: "Pirates Royale is a thrilling multiplayer game where you join the quest for treasure on the high seas. Battle other players, outwit your rivals, and claim the ultimate pirate glory.\n\nComing soon — gather your crew and prepare to set sail.",
    image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&h=600&fit=crop&crop=center",
    screenshots: [
      "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&h=450&fit=crop&crop=center"
    ],
    tags: ["Mobile", "Multiplayer", "Coming Soon"],
    genre: "Multiplayer",
    platform: ["Android", "iOS"],
    status: "Coming Soon",
    rating: 0,
    downloads: "—",
    releaseDate: "",
    createdAt: now,
    updatedAt: now,
    createdBy: "system"
  }
]

// API функции для игр
export async function fetchGames(): Promise<Game[]> {
  try {
    // Игры доступны без авторизации
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/games`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    if (!response.ok) {
      console.warn('Server unavailable, using fallback games data')
      return fallbackGames
    }
    
    const result = await response.json()
    if (!result.success) {
      console.warn('Server error, using fallback games data:', result.error)
      return fallbackGames
    }
    
    return result.data
  } catch (error) {
    console.warn('Network error, using fallback games data:', error)
    return fallbackGames
  }
}

export async function createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Game> {
  return apiRequest('/games', {
    method: 'POST',
    body: JSON.stringify(gameData),
  })
}

export async function updateGame(id: string, gameData: Partial<Game>): Promise<Game> {
  return apiRequest(`/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(gameData),
  })
}

export async function deleteGame(id: string): Promise<void> {
  await apiRequest(`/games/${id}`, {
    method: 'DELETE',
  })
}

// Fallback данные для контента сайта
const fallbackSiteContent: SiteContent = {
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
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Driving the technical vision behind our mobile games and live-ops."
    },
    {
      id: 2,
      name: "Game Designer",
      role: "Design",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Designing core gameplay loops across our puzzle, casual, and arcade titles."
    },
    {
      id: 3,
      name: "2D Artist",
      role: "Art & Animation",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Creating the look and feel of every Nexenova Studios title."
    }
  ],
  companyInfo: {
    name: "Nexenova Studios",
    description: "We are a passionate team of mobile game developers dedicated to crafting memorable gaming experiences.",
    email: "support@nexenovastudios.com",
    phone: "",
    address: "India"
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// API функции для контента сайта
export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    // Контент сайта доступен без авторизации
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/content`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    if (!response.ok) {
      console.warn('Server unavailable, using fallback site content')
      return fallbackSiteContent
    }
    
    const result = await response.json()
    if (!result.success) {
      console.warn('Server error, using fallback site content:', result.error)
      return fallbackSiteContent
    }
    
    return result.data
  } catch (error) {
    console.warn('Network error, using fallback site content:', error)
    return fallbackSiteContent
  }
}

export async function updateSiteContent(contentData: SiteContent): Promise<SiteContent> {
  return apiRequest('/content', {
    method: 'PUT',
    body: JSON.stringify(contentData),
  })
}

// API функции для загрузки файлов
export async function uploadFile(file: File, gameId: string, type: 'main' | 'screenshot'): Promise<{ fileName: string; url: string; path: string }> {
  const token = getAuthToken()
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('gameId', gameId)
  formData.append('type', type)

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (response.status === 401) {
    logout()
    throw new Error('Authentication required')
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed')
  }

  return result.data
}

export async function deleteFile(filePath: string): Promise<void> {
  await apiRequest(`/files/${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  })
}

export async function getFileUrl(filePath: string): Promise<string> {
  const result = await apiRequest(`/files/${encodeURIComponent(filePath)}/url`)
  return result.signedUrl
}

// Админские функции
export async function fetchUsers(): Promise<User[]> {
  return apiRequest('/admin/users')
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  return apiRequest('/admin/audit-log')
}

// Функция инициализации базы данных
export async function initializeDatabase(): Promise<void> {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })

    if (!response.ok) {
      console.warn('Server initialization endpoint not available, using fallback')
      return // Продолжаем работу без серверной инициализации
    }

    const result = await response.json()
    
    if (!result.success) {
      console.warn('Server initialization failed:', result.error)
      return // Продолжаем работу
    }
  } catch (error) {
    console.warn('Database initialization failed, continuing with fallback:', error)
    // Не выбрасываем ошибку, позволяем приложению работать
  }
}

// Функция для получения статистики
export async function getSystemStats() {
  try {
    const [games, users, auditLog] = await Promise.all([
      fetchGames().catch(() => []),
      isAuthenticated() ? fetchUsers().catch(() => []) : [],
      isAuthenticated() ? fetchAuditLog().catch(() => []) : []
    ])

    return {
      gamesCount: games.length,
      usersCount: users.length,
      actionsCount: auditLog.length,
      lastActions: auditLog.slice(0, 5) // Последние 5 действий
    }
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return {
      gamesCount: fallbackGames.length,
      usersCount: 0,
      actionsCount: 0,
      lastActions: []
    }
  }
}