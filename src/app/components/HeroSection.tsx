import { motion } from 'motion/react'
import { Button } from './ui/button'
import { Play, ArrowRight } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

interface HeroStats {
  gamesPublished: number
  yearsExperience: number
  happyClients: number
  downloads: number
}

interface HeroSectionProps {
  stats?: HeroStats
}

export function HeroSection({ stats }: HeroSectionProps) {
  const heroStats = stats || {
    gamesPublished: 4,
    yearsExperience: 5,
    happyClients: 50,
    downloads: 10000
  }

  const scrollToContact = () => {
    const element = document.querySelector('#contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 pt-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* First animated blob */}
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
        
        {/* Second animated blob */}
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
        
        {/* Third animated blob */}
        <motion.div
          animate={{
            x: [-200, 250, -100, 200, -200],
            y: [200, -150, 100, -200, 200],
            scale: [0.8, 1.5, 1, 1.2, 0.8],
            rotate: [0, 270, 540, 810, 1080],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-accent/6 to-secondary/8 dark:from-accent/3 dark:to-secondary/4 rounded-full blur-3xl"
        />
        
        {/* Fourth animated blob */}
        <motion.div
          animate={{
            x: [150, -200, 100, -150, 150],
            y: [-100, 150, -80, 120, -100],
            scale: [1.1, 0.7, 1.3, 0.9, 1.1],
            rotate: [360, 180, 0, -180, -360],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-1/4 w-72 h-72 bg-gradient-to-tr from-primary/4 to-secondary/6 dark:from-primary/2 dark:to-secondary/3 rounded-full blur-3xl"
        />
        
        {/* Fifth animated blob */}
        <motion.div
          animate={{
            x: [-150, 180, -80, 200, -150],
            y: [120, -100, 180, -120, 120],
            scale: [0.9, 1.4, 0.6, 1.2, 0.9],
            rotate: [-180, 90, -90, 270, -180],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 left-1/3 w-60 h-60 bg-gradient-to-bl from-accent/5 to-primary/7 dark:from-accent/2 dark:to-primary/3 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-5 py-3 bg-primary/10 dark:bg-primary/5 rounded-full mb-8"
            >
              <motion.span 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-3 text-lg"
              >
                ✨
              </motion.span>
              <span className="text-lg font-medium text-primary">Crafting Interactive Experiences</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
              >
                Welcome to
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                Nexenova Studios
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Creating Immersive Gaming Experiences
            </motion.p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" onClick={scrollToContact} className="group text-lg px-8 py-4 h-auto">
                Start Your Project
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg" onClick={scrollToPortfolio} className="group text-lg px-8 py-4 h-auto">
                <motion.div
                  className="mr-3"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play className="h-5 w-5" />
                </motion.div>
                View Our Games
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-center p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/20"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
                <AnimatedCounter value={heroStats.gamesPublished} suffix="" />
              </div>
              <p className="text-muted-foreground text-lg">Games Developed</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-center p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/20"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
                <AnimatedCounter value={Math.floor(heroStats.downloads / 1000)} suffix="K+" />
              </div>
              <p className="text-muted-foreground text-lg">Players Worldwide</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-center p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/20"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
                <AnimatedCounter value={heroStats.yearsExperience} suffix="+" />
              </div>
              <p className="text-muted-foreground text-lg">Years Experience</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}