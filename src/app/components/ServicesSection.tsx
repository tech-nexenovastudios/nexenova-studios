import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Monitor, Smartphone, Gamepad, Palette, Code, Headphones } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

export function ServicesSection() {
  const services = [
    {
      icon: Monitor,
      title: 'PC Game Development',
      description: 'High-performance games for Windows, Mac, and Linux platforms with stunning graphics and smooth gameplay.',
      features: ['Steam Integration', 'Advanced Graphics', 'Mod Support', 'Cloud Saves']
    },
    {
      icon: Smartphone,
      title: 'Mobile Game Development',
      description: 'Engaging mobile games for iOS and Android with intuitive touch controls and optimized performance.',
      features: ['Cross-Platform', 'In-App Purchases', 'Social Features', 'Analytics']
    },
    {
      icon: Gamepad,
      title: 'Console Development',
      description: 'AAA console games for PlayStation, Xbox, and Nintendo Switch with platform-specific optimizations.',
      features: ['HDR Support', 'Achievement Systems', 'Multiplayer', 'Platform Compliance']
    },
    {
      icon: Palette,
      title: 'Game Art & Design',
      description: 'Stunning visual assets, character design, and environmental art that brings your game world to life.',
      features: ['2D/3D Art', 'Character Design', 'UI/UX Design', 'Animation']
    },
    {
      icon: Code,
      title: 'Custom Game Engines',
      description: 'Tailored game engines and tools designed specifically for your project\'s unique requirements.',
      features: ['Performance Optimized', 'Scalable Architecture', 'Custom Tools', 'Documentation']
    },
    {
      icon: Headphones,
      title: 'Audio Design',
      description: 'Immersive soundscapes, music composition, and audio implementation that enhances the gaming experience.',
      features: ['3D Audio', 'Dynamic Music', 'Voice Acting', 'Sound Effects']
    }
  ]

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Our Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            From initial concept to final release, we offer comprehensive game development 
            services to bring your vision to life across all major platforms.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimatedSection
              key={index}
              delay={index * 0.1}
              direction={index % 2 === 0 ? 'up' : 'down'}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group border-0 bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader>
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                    >
                      <service.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="text-sm text-muted-foreground flex items-center"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: featureIndex * 0.2 }}
                            className="w-1.5 h-1.5 bg-primary rounded-full mr-2"
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-16 text-center" delay={0.5}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg p-8 backdrop-blur-sm"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-4"
            >
              Ready to Start Your Project?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground mb-6"
            >
              Let's discuss your game development needs and create something amazing together.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Get Started Today
              </motion.span>
            </motion.button>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}