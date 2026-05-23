import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Mail, MapPin, Send, CheckCircle, MessageCircle, Newspaper, Handshake } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { AnimatedSection } from './AnimatedSection'

interface CompanyInfo {
  name: string
  description: string
  email: string
  phone: string
  address: string
}

interface ContactSectionProps {
  companyInfo?: CompanyInfo
  onNavigateToPrivacy?: () => void
  onNavigateToTerms?: () => void
}

const TOPICS = [
  { value: 'feedback', label: 'Player feedback', icon: MessageCircle },
  { value: 'press', label: 'Press inquiry', icon: Newspaper },
  { value: 'partnership', label: 'Partnership', icon: Handshake },
  { value: 'other', label: 'Something else', icon: Mail },
]

export function ContactSection({
  companyInfo,
  onNavigateToPrivacy,
  onNavigateToTerms,
}: ContactSectionProps) {
  const defaults: CompanyInfo = companyInfo || {
    name: 'Nexenova Studios',
    description: 'Independent mobile game studio based in India.',
    email: 'support@nexenovastudios.com',
    phone: '',
    address: 'India',
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTopicClick = (topic: string) => {
    setFormData({ ...formData, topic })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.topic || !formData.message) {
      toast.error('Tell us your name, email, what it’s about, and the message.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            projectType: formData.topic,
            message: formData.message,
          }),
        },
      )
      const result = await response.json()
      if (result.success) {
        setIsSubmitted(true)
        toast.success("Got it. We'll write back as soon as we can.")
        setFormData({ name: '', email: '', topic: '', message: '' })
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to send. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block text-xs uppercase tracking-[0.22em] text-primary font-medium mb-4"
          >
            Get in Touch
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-5 tracking-tight"
          >
            Say hello.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Bug report? Press kit? Found a level too hard? We read everything &mdash; even the typos.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Left: contact info */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href={`mailto:${defaults.email}`}
                      className="text-sm text-primary hover:underline underline-offset-4 break-all"
                    >
                      {defaults.email}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      We usually reply within a couple of days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1">Based In</h3>
                    <p className="text-sm">{defaults.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Building mobile games for everywhere.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Press &amp; partnerships</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Looking for screenshots, builds, or a chat? Same inbox &mdash; just pick &ldquo;Press inquiry&rdquo; or &ldquo;Partnership&rdquo; on the form.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <span>Message received</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Drop us a line</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-10">
                    <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Thanks for writing.</h3>
                    <p className="text-sm text-muted-foreground">
                      We&rsquo;ll be back in your inbox shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Your name</label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Riley"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Email</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="riley@example.com"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">What&rsquo;s it about?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TOPICS.map((topic) => {
                          const Icon = topic.icon
                          const isSelected = formData.topic === topic.value
                          return (
                            <button
                              key={topic.value}
                              type="button"
                              onClick={() => handleTopicClick(topic.value)}
                              disabled={isSubmitting}
                              className={`px-3 py-3 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {topic.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Message</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us what's on your mind. The shorter the better."
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By sending, you agree to our{' '}
                      <button
                        type="button"
                        onClick={onNavigateToTerms}
                        className="text-primary hover:underline"
                      >
                        Terms
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={onNavigateToPrivacy}
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </button>
                      .
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
