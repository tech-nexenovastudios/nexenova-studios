import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Mail, Phone, MapPin, Send, Clock, Globe, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../utils/supabase/info'

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
  onNavigateToCookies?: () => void
}

export function ContactSection({ 
  companyInfo,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToCookies
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const defaultCompanyInfo = companyInfo || {
    name: "Nexenova Studios",
    description: "We are a passionate team of mobile game developers dedicated to crafting memorable gaming experiences.",
    email: "support@nexenovastudios.com",
    phone: "",
    address: "India"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.projectType || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          projectType: '',
          budget: '',
          message: ''
        })

        // Reset submitted state after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: defaultCompanyInfo.email,
      description: 'Send us your project details'
    },
    ...(defaultCompanyInfo.phone
      ? [{
          icon: Phone,
          title: 'Call Us',
          content: defaultCompanyInfo.phone,
          description: 'Mon-Fri 9AM-6PM IST'
        }]
      : []),
    {
      icon: MapPin,
      title: 'Based In',
      content: defaultCompanyInfo.address,
      description: 'Working with partners worldwide'
    }
  ]

  const projectTypes = [
    'Mobile Game',
    'PC Game',
    'Console Game',
    'VR/AR Game',
    'Web Game',
    'Game Art & Design',
    'Game Audio',
    'Consulting',
    'Other'
  ]

  const budgetRanges = [
    'Under $10K',
    '$10K - $50K',
    '$50K - $100K',
    '$100K - $500K',
    '$500K+',
    'Let\'s Discuss'
  ]

  return (
    <section id="contact" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to bring your game idea to life? Let's discuss your project and 
            explore how {defaultCompanyInfo.name} can help you create an amazing gaming experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.title}</h3>
                      <p className="text-sm mb-1">{info.content}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Message Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Start Your Project</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Thank you for your message!</h3>
                    <p className="text-muted-foreground">
                      We've received your project inquiry and will get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Name *</label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Email *</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Company / Organization</label>
                      <Input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Project Type *</label>
                        <select
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
                        >
                          <option value="">Select project type</option>
                          {projectTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Budget Range</label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
                        >
                          <option value="">Select budget range</option>
                          {budgetRanges.map((range) => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Project Description *</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us about your game idea, target platforms, timeline, and any specific requirements..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        Remote Friendly
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Free Consultation
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        NDA Available
                      </Badge>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
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
                      By submitting this form, you agree to our{' '}
                      <button
                        type="button"
                        onClick={onNavigateToTerms}
                        className="text-primary hover:underline"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={onNavigateToPrivacy}
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </button>
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