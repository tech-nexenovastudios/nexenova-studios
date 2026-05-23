import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { X, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { isValidImageType, isValidImageSize, compressImage, formatFileSize } from '../../utils/imageUtils'
import { useToast, toast } from '../ui/toast'

interface ImageUploaderProps {
  label: string
  value: string
  onChange: (url: string, path?: string) => void
  gameId: string
  type: 'main' | 'screenshot'
  onRemove?: () => void
  placeholder?: string
  required?: boolean
}

export function ImageUploader({
  label,
  value,
  onChange,
  gameId,
  type,
  onRemove,
  placeholder,
  required = false
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Validate file type
      if (!isValidImageType(file)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      }

      // Validate file size
      if (!isValidImageSize(file, 10)) {
        throw new Error(`File size too large (${formatFileSize(file.size)}). Maximum 10MB allowed.`)
      }

      // Compress image if it's large
      let fileToUpload = file
      if (file.size > 2 * 1024 * 1024) { // If larger than 2MB, compress
        setUploadProgress(10)
        try {
          fileToUpload = await compressImage(file, 1920, 1080, 0.85)
          console.log(`Compressed image from ${formatFileSize(file.size)} to ${formatFileSize(fileToUpload.size)}`)
        } catch (compressionError) {
          console.warn('Image compression failed, using original file:', compressionError)
          fileToUpload = file
        }
      }

      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('gameId', gameId)
      formData.append('type', type)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      onChange(result.data.url, result.data.path)
      
      // Show success for a moment before hiding progress
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

    } catch (error) {
      console.error('Upload error:', error)
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (isValidImageType(file)) {
        uploadFile(file)
      } else {
        alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      }
    }
  }, [uploadFile])

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
    }
  }

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      {/* Current Image Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-2">
              <div className="relative group">
                <ImageWithFallback
                  src={value}
                  alt={`${label} preview`}
                  className="w-full h-32 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(value, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {onRemove && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onRemove}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upload Progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50'
        }`}
        onDrag={handleDrag}
        onDragStart={handleDrag}
        onDragEnd={handleDrag}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop image here' : 'Upload Image'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports: JPEG, PNG, WebP (Max 10MB)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`file-${type}-${gameId}`)?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              
              <input
                id={`file-${type}-${gameId}`}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Input Alternative */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Or enter image URL
        </Label>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={placeholder || "https://example.com/image.jpg"}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            variant="outline"
            disabled={!urlInput.trim()}
          >
            Add URL
          </Button>
        </div>
      </div>
    </div>
  )
}