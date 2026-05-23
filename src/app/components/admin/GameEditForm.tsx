import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { X, Plus, Save, ArrowLeft } from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { MultiImageUploader } from './MultiImageUploader'

interface Game {
  id: string
  title: string
  description: string
  fullDescription: string
  image: string
  tags: string[]
  steamUrl?: string
  status: string
  downloads: string
  rating: number
  screenshots: string[]
  videoUrl?: string
  releaseDate: string
  genre: string
  platform: string[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

interface GameEditFormProps {
  game?: Game
  onSave: (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void
  onCancel: () => void
}

export function GameEditForm({ game: initialGame, onSave, onCancel }: GameEditFormProps) {
  const [game, setGame] = useState<Game>({
    id: initialGame?.id || '',
    title: initialGame?.title || '',
    description: initialGame?.description || '',
    fullDescription: initialGame?.fullDescription || '',
    image: initialGame?.image || '',
    tags: initialGame?.tags || [],
    steamUrl: initialGame?.steamUrl || '',
    status: initialGame?.status || 'In Development',
    downloads: initialGame?.downloads || '0',
    rating: initialGame?.rating || 0,
    screenshots: initialGame?.screenshots || [],
    videoUrl: initialGame?.videoUrl || '',
    releaseDate: initialGame?.releaseDate || '',
    genre: initialGame?.genre || '',
    platform: initialGame?.platform || []
  })
  
  // Track file paths for cleanup on delete
  const [imagePaths, setImagePaths] = useState<{
    main?: string
    screenshots: string[]
  }>({ screenshots: [] })

  const [newTag, setNewTag] = useState('')
  const [newScreenshot, setNewScreenshot] = useState('')
  const [newPlatform, setNewPlatform] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const gameData = {
        title: game.title,
        description: game.description,
        fullDescription: game.fullDescription,
        image: game.image,
        tags: game.tags,
        steamUrl: game.steamUrl,
        status: game.status,
        downloads: game.downloads,
        rating: game.rating,
        screenshots: game.screenshots,
        videoUrl: game.videoUrl,
        releaseDate: game.releaseDate,
        genre: game.genre,
        platform: game.platform
      }
      
      await onSave(gameData)
    } catch (error) {
      console.error('Error saving game:', error)
      alert('Failed to save game. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !game.tags.includes(newTag.trim())) {
      setGame(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setGame(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addScreenshot = () => {
    if (newScreenshot.trim() && !game.screenshots.includes(newScreenshot.trim())) {
      setGame(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, newScreenshot.trim()]
      }))
      setNewScreenshot('')
    }
  }

  const removeScreenshot = (screenshotToRemove: string, index: number) => {
    setGame(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(screenshot => screenshot !== screenshotToRemove)
    }))
    
    // Remove corresponding path if it exists
    setImagePaths(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }))
  }

  const handleMainImageChange = (url: string, path?: string) => {
    setGame(prev => ({ ...prev, image: url }))
    if (path) {
      setImagePaths(prev => ({ ...prev, main: path }))
    }
  }

  const addPlatform = () => {
    if (newPlatform.trim() && !game.platform.includes(newPlatform.trim())) {
      setGame(prev => ({
        ...prev,
        platform: [...prev.platform, newPlatform.trim()]
      }))
      setNewPlatform('')
    }
  }

  const removePlatform = (platformToRemove: string) => {
    setGame(prev => ({
      ...prev,
      platform: prev.platform.filter(platform => platform !== platformToRemove)
    }))
  }

  const generateGameId = () => {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {initialGame ? 'Edit Game' : 'Add New Game'}
          </h1>
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Game Title</Label>
                  <Input
                    id="title"
                    value={game.title}
                    onChange={(e) => setGame(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter game title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={game.genre}
                    onChange={(e) => setGame(prev => ({ ...prev, genre: e.target.value }))}
                    placeholder="e.g., Action, Horror, Platformer"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={game.description}
                  onChange={(e) => setGame(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description for game cards"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={game.fullDescription}
                  onChange={(e) => setGame(prev => ({ ...prev, fullDescription: e.target.value }))}
                  placeholder="Detailed description for the game page"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={game.status} onValueChange={(value) => setGame(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="In Development">In Development</SelectItem>
                      <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setGame(prev => ({ ...prev, releaseDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Image Upload */}
              <ImageUploader
                label="Main Game Image"
                value={game.image}
                onChange={handleMainImageChange}
                gameId={game.id || generateGameId()}
                type="main"
                placeholder="https://example.com/image.jpg"
                required
              />

              {/* YouTube Video URL */}
              <div>
                <Label htmlFor="videoUrl">YouTube Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  value={game.videoUrl}
                  onChange={(e) => setGame(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Screenshots Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Screenshots</Label>
                
                {/* Multi-Image Uploader */}
                <MultiImageUploader
                  label="Screenshots"
                  images={game.screenshots}
                  onChange={(screenshots) => setGame(prev => ({ ...prev, screenshots }))}
                  gameId={game.id || generateGameId()}
                  type="screenshot"
                  maxImages={8}
                />

                {/* URL Input Alternative */}
                <div className="border-t pt-4">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Or add screenshot by URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newScreenshot}
                      onChange={(e) => setNewScreenshot(e.target.value)}
                      placeholder="Screenshot URL"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addScreenshot())}
                    />
                    <Button type="button" onClick={addScreenshot}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {game.screenshots.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {game.screenshots.map((screenshot, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          Screenshot {index + 1}
                          <button
                            type="button"
                            onClick={() => removeScreenshot(screenshot, index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Platforms */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Tags & Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag (e.g., Co-op, Horror)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      placeholder="Add platform (e.g., PC, Steam)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlatform())}
                    />
                    <Button type="button" onClick={addPlatform}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {game.platform.map((platform, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {platform}
                        <button
                          type="button"
                          onClick={() => removePlatform(platform)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Links & Stats */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>External Links & Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="steamUrl">Steam Store URL</Label>
                <Input
                  id="steamUrl"
                  value={game.steamUrl}
                  onChange={(e) => setGame(prev => ({ ...prev, steamUrl: e.target.value }))}
                  placeholder="https://store.steampowered.com/app/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="downloads">Downloads</Label>
                  <Input
                    id="downloads"
                    value={game.downloads}
                    onChange={(e) => setGame(prev => ({ ...prev, downloads: e.target.value }))}
                    placeholder="e.g., 5.2k, 1.2M"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={game.rating}
                    onChange={(e) => setGame(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g., 4.8, 9.2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Game'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}