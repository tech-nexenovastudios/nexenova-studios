import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { ExidLogo } from '../ExidLogo'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

interface AdminLoginPageProps {
  onNavigateHome: () => void
  onLoginSuccess: (userData: any) => void
}

export function AdminLoginPage({ onNavigateHome, onLoginSuccess }: AdminLoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExidLoading, setIsExidLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (result.success) {
        // Сохраняем токен и данные пользователя в localStorage
        localStorage.setItem('authToken', result.data.token)
        localStorage.setItem('userData', JSON.stringify(result.data.user))
        
        onLoginSuccess(result.data.user)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
    }
    
    setIsLoading(false)
  }

  const handleExidAuth = async () => {
    setIsExidLoading(true)
    setError('')

    try {
      // Плейсхолдер для EXID авторизации
      // В будущем здесь будет интеграция с EXID API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Симуляция запроса
      
      // Имитация успешной авторизации через EXID
      const mockExidUser = {
        id: 'exid-user-1',
        email: 'admin@exid.secure',
        name: 'EXID Admin',
        role: 'admin',
        authProvider: 'exid'
      }

      // Сохраняем данные пользователя
      localStorage.setItem('authToken', 'mock-exid-token-' + Date.now())
      localStorage.setItem('userData', JSON.stringify(mockExidUser))
      
      onLoginSuccess(mockExidUser)
    } catch (error) {
      console.error('EXID Auth error:', error)
      setError('EXID authentication failed. Please try again.')
    }

    setIsExidLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please fill in email and password fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name: email.split('@')[0], // Используем часть email как имя
          role: 'admin' 
        })
      })

      const result = await response.json()

      if (result.success) {
        setError('')
        alert('Registration successful! Please log in with your credentials.')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="border border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-2">Admin Panel</CardTitle>
            <p className="text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* EXID Authentication Button */}
            <div className="mb-6">
              <Button
                onClick={handleExidAuth}
                variant="outline"
                className="w-full h-12 relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                disabled={isExidLoading || isLoading}
              >
                <div className="flex items-center justify-center space-x-3">
                  <ExidLogo size="md" />
                  <span className="text-base font-semibold">
                    {isExidLoading ? 'Connecting to EXID...' : 'Sign in with EXID'}
                  </span>
                </div>
                {isExidLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Secure authentication powered by EXID
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@nexenovastudios.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isExidLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isExidLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isExidLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isExidLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isLoading || isExidLoading}
                >
                  Create Admin Account
                </Button>
              </div>
            </form>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={onNavigateHome}
                className="w-full"
                disabled={isExidLoading}
              >
                Back to Website
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Default admin: admin@nexenovastudios.com / admin123!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Or create a new admin account above
              </p>
              <div className="mt-3 p-2 bg-muted/30 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <ExidLogo size="sm" className="inline mr-1" />
                  EXID Auth is currently in demo mode
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}