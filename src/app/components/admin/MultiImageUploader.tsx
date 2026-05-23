import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { X, Upload, Image as ImageIcon, Plus } from 'lucide-react'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { isValidImageType, isValidImageSize, compressImage, formatFileSize } from '../../utils/imageUtils'

interface MultiImageUploaderProps {
  label: string
  images: string[]
  onChange: (images: string[]) => void
  gameId: string
  type: 'screenshot'
  maxImages?: number
}

interface UploadState {
  file: File
  progress: number
  error?: string
  completed?: boolean
  url?: string
}

export function MultiImageUploader({
  label,
  images,
  onChange,
  gameId,
  type,
  maxImages = 6
}: MultiImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map())

  const uploadFile = async (file: File, uploadId: string) => {
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
        setUploads(prev => {
          const newUploads = new Map(prev)
          const upload = newUploads.get(uploadId)
          if (upload) {
            upload.progress = 10
            newUploads.set(uploadId, { ...upload })
          }
          return newUploads
        })

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
        setUploads(prev => {
          const newUploads = new Map(prev)
          const upload = newUploads.get(uploadId)
          if (upload && upload.progress < 90) {
            upload.progress = Math.min(upload.progress + 10, 90)
            newUploads.set(uploadId, { ...upload })
          }
          return newUploads
        })
      }, 200)

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      })

      clearInterval(progressInterval)

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Mark as completed
      setUploads(prev => {
        const newUploads = new Map(prev)
        newUploads.set(uploadId, {
          file: fileToUpload,
          progress: 100,
          completed: true,
          url: result.data.url
        })
        return newUploads
      })

      // Add to images list
      onChange([...images, result.data.url])

      // Remove from uploads after delay
      setTimeout(() => {
        setUploads(prev => {
          const newUploads = new Map(prev)
          newUploads.delete(uploadId)
          return newUploads
        })
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploads(prev => {
        const newUploads = new Map(prev)
        newUploads.set(uploadId, {
          file,
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed'
        })
        return newUploads
      })
    }
  }

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => isValidImageType(file))
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files (JPEG, PNG, WebP, or GIF)')
      return
    }

    if (imageFiles.length !== fileArray.length) {
      alert(`${fileArray.length - imageFiles.length} file(s) were skipped (invalid image format)`)
    }

    if (images.length + imageFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed. ${images.length + imageFiles.length - maxImages} files will be skipped.`)
      imageFiles.splice(maxImages - images.length)
    }

    const oversizedFiles = imageFiles.filter(file => !isValidImageSize(file, 10))
    if (oversizedFiles.length > 0) {
      alert(`${oversizedFiles.length} file(s) are too large (max 10MB). They will be compressed or skipped.`)
    }

    imageFiles.forEach(file => {
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setUploads(prev => {
        const newUploads = new Map(prev)
        newUploads.set(uploadId, { file, progress: 0 })
        return newUploads
      })

      uploadFile(file, uploadId)
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFiles(files)
    }
    event.target.value = '' // Reset input
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

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [images.length, maxImages])

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const retryUpload = (uploadId: string) => {
    const upload = uploads.get(uploadId)
    if (upload && upload.error) {
      setUploads(prev => {
        const newUploads = new Map(prev)
        newUploads.set(uploadId, { ...upload, error: undefined, progress: 0 })
        return newUploads
      })
      uploadFile(upload.file, uploadId)
    }
  }

  const cancelUpload = (uploadId: string) => {
    setUploads(prev => {
      const newUploads = new Map(prev)
      newUploads.delete(uploadId)
      return newUploads
    })
  }

  const canAddMore = images.length + uploads.size < maxImages

  return (
    <div className="space-y-4">
      {/* Current Images Grid */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Current {label} ({images.length}/{maxImages})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-2">
                    <div className="relative">
                      <ImageWithFallback
                        src={image}
                        alt={`${label} ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="absolute top-1 left-1 text-xs"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Uploading Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from(uploads.entries()).map(([uploadId, upload]) => (
                  <div key={uploadId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[200px]">{upload.file.name}</span>
                      <div className="flex items-center gap-2">
                        {upload.error ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryUpload(uploadId)}
                            >
                              Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelUpload(uploadId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : upload.completed ? (
                          <Badge variant="default">Complete</Badge>
                        ) : (
                          <>
                            <span>{upload.progress}%</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelUpload(uploadId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {upload.error ? (
                      <p className="text-sm text-destructive">{upload.error}</p>
                    ) : (
                      <Progress value={upload.progress} className="h-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      {canAddMore && (
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
                  {dragActive ? 'Drop images here' : `Add ${label}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop multiple images here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: JPEG, PNG, WebP (Max 10MB each) • {maxImages - images.length} remaining
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`multi-file-${gameId}`)?.click()}
                disabled={uploads.size > 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Select Images
              </Button>
              
              <input
                id={`multi-file-${gameId}`}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploads.size > 0}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum number of images reached ({maxImages})
        </p>
      )}
    </div>
  )
}