import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Save, Plus, X } from 'lucide-react'

interface SiteContent {
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

interface ContentEditFormProps {
  content: SiteContent
  onSave: (content: SiteContent) => void
}

export function ContentEditForm({ content: initialContent, onSave }: ContentEditFormProps) {
  const [content, setContent] = useState<SiteContent>(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    social: { twitter: '', linkedin: '', github: '' }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave(content)
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSection = (section: keyof SiteContent, data: any) => {
    setContent(prev => ({
      ...prev,
      [section]: Array.isArray(data) ? data : { ...prev[section], ...data }
    }))
  }

  if (!content.heroStats) return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/50 rounded w-64 mx-auto mb-4" />
          <div className="h-4 bg-muted/50 rounded w-48 mx-auto" />
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Edit Site Content</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="hero" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hero">Hero Stats</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>

            {/* Hero Section */}
            <TabsContent value="hero">
              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Hero Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero-games">Games Published</Label>
                      <Input
                        id="hero-games"
                        type="number"
                        value={content.heroStats?.gamesPublished || 0}
                        onChange={(e) => updateSection('heroStats', { 
                          gamesPublished: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-experience">Years of Experience</Label>
                      <Input
                        id="hero-experience"
                        type="number"
                        value={content.heroStats?.yearsExperience || 0}
                        onChange={(e) => updateSection('heroStats', { 
                          yearsExperience: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-clients">Happy Clients</Label>
                      <Input
                        id="hero-clients"
                        type="number"
                        value={content.heroStats?.happyClients || 0}
                        onChange={(e) => updateSection('heroStats', { 
                          happyClients: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-downloads">Total Downloads</Label>
                      <Input
                        id="hero-downloads"
                        type="number"
                        value={content.heroStats?.downloads || 0}
                        onChange={(e) => updateSection('heroStats', { 
                          downloads: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Section */}
            <TabsContent value="team">
              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Team Members</Label>
                    <div className="space-y-4">
                      {content.teamMembers?.map((member, index) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newMembers = content.teamMembers?.filter((_, i) => i !== index) || []
                                updateSection('teamMembers', newMembers)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.bio}</p>
                        </div>
                      )) || []}
                      
                      <div className="border border-dashed border-border rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Name"
                            value={newMember.name}
                            onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <Input
                            placeholder="Role"
                            value={newMember.role}
                            onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                          />
                          <Input
                            placeholder="Image URL"
                            value={newMember.image}
                            onChange={(e) => setNewMember(prev => ({ ...prev, image: e.target.value }))}
                          />
                          <Textarea
                            placeholder="Bio"
                            value={newMember.bio}
                            onChange={(e) => setNewMember(prev => ({ ...prev, bio: e.target.value }))}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => {
                            if (newMember.name.trim()) {
                              const updatedMembers = [
                                ...(content.teamMembers || []),
                                {
                                  id: Date.now(),
                                  name: newMember.name,
                                  role: newMember.role,
                                  bio: newMember.bio,
                                  image: newMember.image
                                }
                              ]
                              updateSection('teamMembers', updatedMembers)
                              setNewMember({
                                name: '',
                                role: '',
                                bio: '',
                                image: '',
                                social: { twitter: '', linkedin: '', github: '' }
                              })
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Information */}
            <TabsContent value="company">
              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={content.companyInfo?.name || ''}
                      onChange={(e) => updateSection('companyInfo', { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-description">Description</Label>
                    <Textarea
                      id="company-description"
                      value={content.companyInfo?.description || ''}
                      onChange={(e) => updateSection('companyInfo', { description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={content.companyInfo?.email || ''}
                        onChange={(e) => updateSection('companyInfo', { email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-phone">Phone</Label>
                      <Input
                        id="company-phone"
                        value={content.companyInfo?.phone || ''}
                        onChange={(e) => updateSection('companyInfo', { phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company-address">Address</Label>
                    <Input
                      id="company-address"
                      value={content.companyInfo?.address || ''}
                      onChange={(e) => updateSection('companyInfo', { address: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}