import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { 
  Settings, 
  Gamepad2, 
  Users, 
  FileText, 
  Upload, 
  Activity,
  LogOut,
  Shield,
  Database,
  Clock,
  AlertCircle
} from 'lucide-react'
import { ContentEditForm } from './ContentEditForm'
import { GameEditForm } from './GameEditForm'
import { 
  fetchGames, 
  fetchSiteContent, 
  createGame, 
  updateGame, 
  deleteGame,
  updateSiteContent,
  logoutUser,
  getUserData,
  fetchUsers,
  fetchAuditLog,
  getSystemStats,
  initializeDatabase,
  type Game, 
  type SiteContent,
  type User,
  type AuditLogEntry
} from './DataManager'
import { Alert, AlertDescription } from '../ui/alert'
import { toast } from 'sonner@2.0.3'

interface AdminDashboardProps {
  onNavigateHome: () => void
  onLogout: () => void
}

export function AdminDashboard({ onNavigateHome, onLogout }: AdminDashboardProps) {
  const [games, setGames] = useState<Game[]>([])
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [systemStats, setSystemStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    loadData()
    setCurrentUser(getUserData())
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Инициализируем базу данных если нужно
      await initializeDatabase()
      
      // Загружаем основные данные
      const [gamesData, contentData, statsData] = await Promise.all([
        fetchGames(),
        fetchSiteContent(),
        getSystemStats()
      ])

      setGames(gamesData)
      setSiteContent(contentData)
      setSystemStats(statsData)

      // Загружаем админские данные если есть права
      try {
        const [usersData, auditData] = await Promise.all([
          fetchUsers(),
          fetchAuditLog()
        ])
        setUsers(usersData)
        setAuditLog(auditData)
      } catch (error) {
        console.log('Admin data not accessible:', error)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleGameSave = async (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (editingGame) {
        const updatedGame = await updateGame(editingGame.id, gameData)
        setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g))
        toast.success('Game updated successfully')
      } else {
        const newGame = await createGame(gameData)
        setGames([...games, newGame])
        toast.success('Game created successfully')
      }
      setEditingGame(null)
      await loadData() // Обновляем статистику
    } catch (error) {
      console.error('Error saving game:', error)
      toast.error('Failed to save game')
    }
  }

  const handleGameDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return
    
    try {
      await deleteGame(gameId)
      setGames(games.filter(g => g.id !== gameId))
      toast.success('Game deleted successfully')
      await loadData() // Обновляем статистику
    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('Failed to delete game')
    }
  }

  const handleContentSave = async (contentData: SiteContent) => {
    try {
      const updatedContent = await updateSiteContent(contentData)
      setSiteContent(updatedContent)
      toast.success('Site content updated successfully')
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Failed to update site content')
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      onLogout()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      onLogout() // Выход из системы даже при ошибке
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'destructive'
      case 'editor': return 'default'
      case 'viewer': return 'secondary'
      default: return 'outline'
    }
  }

  const getActionColor = (action: string) => {
    switch(action) {
      case 'create': return 'default'
      case 'update': return 'secondary'
      case 'delete': return 'destructive'
      case 'login': return 'outline'
      case 'logout': return 'outline'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {currentUser?.name || 'Admin'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onNavigateHome}>
              <Settings className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="uploads" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.gamesCount || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.usersCount || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.actionsCount || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Secure</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {systemStats?.lastActions?.length > 0 ? (
                  <div className="space-y-4">
                    {systemStats.lastActions.map((action: AuditLogEntry) => (
                      <div key={action.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-3">
                          <Badge variant={getActionColor(action.action)}>{action.action}</Badge>
                          <span className="text-sm">{action.resource}</span>
                          {action.resourceId && (
                            <span className="text-sm text-muted-foreground">#{action.resourceId}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDate(action.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Games Management</h2>
              <Button onClick={() => setEditingGame({} as Game)}>
                Add New Game
              </Button>
            </div>

            {editingGame ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingGame.id ? 'Edit Game' : 'Add New Game'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GameEditForm
                    game={editingGame.id ? editingGame : undefined}
                    onSave={handleGameSave}
                    onCancel={() => setEditingGame(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <Card key={game.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2">{game.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {game.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGame(game)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleGameDelete(game.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <h2 className="text-2xl font-bold">Site Content Management</h2>
            {siteContent && (
              <ContentEditForm
                content={siteContent}
                onSave={handleContentSave}
              />
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">Users Management</h2>
            <Card>
              <CardContent className="p-6">
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No users found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="uploads" className="space-y-6">
            <h2 className="text-2xl font-bold">Files Management</h2>
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                File uploads are managed through the game editing interface. 
                All uploaded files are securely stored in Supabase Storage with proper access controls.
              </AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                <CardTitle>Upload Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Storage statistics and file management features will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="logs" className="space-y-6">
            <h2 className="text-2xl font-bold">Audit Log</h2>
            <Card>
              <CardContent className="p-6">
                {auditLog.length > 0 ? (
                  <div className="space-y-4">
                    {auditLog.slice(0, 50).map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-4">
                          <Badge variant={getActionColor(log.action)}>{log.action}</Badge>
                          <div>
                            <p className="text-sm font-medium">{log.resource}</p>
                            {log.resourceId && (
                              <p className="text-xs text-muted-foreground">ID: {log.resourceId}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatDate(log.timestamp)}</p>
                          {log.ipAddress && (
                            <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No audit logs found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}