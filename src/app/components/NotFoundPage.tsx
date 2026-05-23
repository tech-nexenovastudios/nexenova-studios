import { motion } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Home, Search, ArrowLeft, GamepadIcon } from 'lucide-react'

interface NotFoundPageProps {
  onNavigateHome: () => void
}

export function NotFoundPage({ onNavigateHome }: NotFoundPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [-100, 100, -50, 150, -100],
            y: [-50, 80, -100, 50, -50],
            scale: [1, 1.3, 0.8, 1.1, 1],
            rotate: [0, 180, 360, 540, 720],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/10 dark:from-primary/3 dark:to-accent/5 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [200, -150, 100, -200, 200],
            y: [100, -80, 120, -60, 100],
            scale: [1.2, 0.9, 1.4, 0.7, 1.2],
            rotate: [720, 540, 360, 180, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-secondary/8 to-primary/5 dark:from-secondary/4 dark:to-primary/3 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* 404 Number with floating animation */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
              404
            </h1>
          </motion.div>

          {/* Error message */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Looks like you've wandered into uncharted territory. The page you're looking for 
              doesn't exist or may have been moved to a different location.
            </p>
          </motion.div>

          {/* Search suggestions */}
          <motion.div variants={itemVariants} className="mb-10">
            <Card className="border border-border bg-card/50 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">What were you looking for?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 h-auto py-3"
                    onClick={onNavigateHome}
                  >
                    <GamepadIcon className="h-4 w-4" />
                    <span>Our Games</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 h-auto py-3"
                    onClick={() => {
                      onNavigateHome()
                      setTimeout(() => {
                        document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
                      }, 100)
                    }}
                  >
                    <span>About Us</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 h-auto py-3"
                    onClick={() => {
                      onNavigateHome()
                      setTimeout(() => {
                        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
                      }, 100)
                    }}
                  >
                    <span>Contact</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                onClick={onNavigateHome}
                className="group text-lg px-8 py-4 h-auto"
              >
                <Home className="h-5 w-5 mr-3" />
                Back to Home
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </motion.div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.history.back()}
                className="text-lg px-8 py-4 h-auto"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                Go Back
              </Button>
            </motion.div>
          </motion.div>

          {/* Fun fact */}
          <motion.div 
            variants={itemVariants} 
            className="mt-16 p-6 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-3"
            >
              🎮
            </motion.div>
            <p className="text-sm text-muted-foreground">
              <strong>Fun Fact:</strong> Did you know that 404 errors got their name from room 404 
              at CERN, where the web was invented? While you're here, why not check out our latest games!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}