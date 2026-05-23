import { projectId, publicAnonKey } from './supabase/info'

/**
 * Check if URL is a Supabase Storage signed URL that might need refreshing
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(`${projectId}.supabase.co/storage/v1/object/sign/`)
}

/**
 * Extract file path from Supabase Storage signed URL
 */
export function extractFilePathFromSignedUrl(signedUrl: string): string | null {
  try {
    const url = new URL(signedUrl)
    const pathMatch = url.pathname.match(/\/object\/sign\/([^\/]+)\/(.+)/)
    if (pathMatch) {
      return pathMatch[2] // Return the file path after bucket name
    }
    return null
  } catch (error) {
    console.error('Error extracting file path:', error)
    return null
  }
}

/**
 * Refresh signed URL for a file
 */
export async function refreshSignedUrl(currentUrl: string): Promise<string> {
  const filePath = extractFilePathFromSignedUrl(currentUrl)
  if (!filePath) {
    return currentUrl // Return original URL if can't extract path
  }

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/files/${encodeURIComponent(filePath)}/url`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    )

    if (response.ok) {
      const result = await response.json()
      return result.data.signedUrl || currentUrl
    }
  } catch (error) {
    console.error('Error refreshing signed URL:', error)
  }

  return currentUrl
}

/**
 * Batch refresh multiple signed URLs
 */
export async function refreshSignedUrls(urls: string[]): Promise<string[]> {
  const refreshPromises = urls.map(url => 
    isSupabaseStorageUrl(url) ? refreshSignedUrl(url) : Promise.resolve(url)
  )
  
  return Promise.all(refreshPromises)
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return allowedTypes.includes(file.type.toLowerCase())
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File, maxSizeInMB: number = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * Generate thumbnail URL for images (if using a CDN that supports it)
 */
export function getThumbnailUrl(imageUrl: string, width: number = 300, height: number = 200): string {
  // For now, return the original URL
  // In the future, this could be enhanced to use image transformation services
  return imageUrl
}

/**
 * Preload image and return promise
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Compress image file before upload
 */
export function compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx!.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original file
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => resolve(file) // Fallback to original file
    img.src = URL.createObjectURL(file)
  })
}