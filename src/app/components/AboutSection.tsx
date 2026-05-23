import { motion } from 'motion/react'
import { Card, CardContent } from './ui/card'
import { Gamepad2, Users, Zap, Award } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

export function AboutSection() {
  const features = [
    {
      icon: Gamepad2,
      title: 'Game Development Excellence',
      description: 'From concept to release, we handle every aspect of game development with precision and creativity.'
    },
    {
      icon: Users,
      title: 'Player-Centric Design',
      description: 'We put players at the heart of every decision, creating engaging experiences that resonate with audiences.'
    },
    {
      icon: Zap,
      title: 'Cutting-Edge Technology',
      description: 'Utilizing the latest game engines and development tools to bring innovative ideas to life.'
    },
    {
      icon: Award,
      title: 'Award-Winning Team',
      description: 'Our talented developers have created multiple award-winning games across various genres and platforms.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            About Nexenova Studios
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Founded by a passionate team in India, Nexenova Studios crafts memorable mobile gaming
            experiences across puzzle, casual, arcade, and adventure genres for global audiences.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <AnimatedSection
              key={index}
              delay={index * 0.1}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                        >
                          <feature.icon className="h-6 w-6 text-primary" />
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection direction="up" delay={0.3}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg p-8 shadow-lg"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  At Nexenova Studios, we believe games should entertain, engage, and inspire.
                  Our mission is to bring gaming to life through innovative, polished mobile titles
                  built on the core values of fun, craftsmanship, and respect for our players.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <p className="text-sm text-muted-foreground">Support Available</p>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="lg:text-right"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg p-8 backdrop-blur-sm"
                >
                  <h4 className="text-xl font-semibold mb-4">Why Choose Us?</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    {[
                      'Proven track record of successful launches',
                      'Cross-platform development expertise',
                      'Agile development methodology',
                      'Post-launch support and maintenance',
                      'Transparent communication throughout'
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="mr-2 text-primary"
                        >
                          •
                        </motion.span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}