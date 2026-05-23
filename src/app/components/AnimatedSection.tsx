import { motion } from 'motion/react'
import { useIntersectionObserver } from './hooks/useIntersectionObserver'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6
}: AnimatedSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '-50px'
  })

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 50, opacity: 0 }
      case 'down': return { y: -50, opacity: 0 }
      case 'left': return { x: -50, opacity: 0 }
      case 'right': return { x: 50, opacity: 0 }
      default: return { y: 50, opacity: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isIntersecting ? { x: 0, y: 0, opacity: 1 } : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
}