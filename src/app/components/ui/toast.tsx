import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'outline'
  }>
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toastData: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const toast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? 5000
    }
    
    setToasts(prev => [...prev, toast])

    // Auto remove after duration (unless duration is 0)
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: () => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-600'
      case 'error':
        return 'border-l-red-600'
      case 'warning':
        return 'border-l-yellow-600'
      case 'info':
        return 'border-l-blue-600'
      default:
        return 'border-l-blue-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border border-border ${getBorderColor()} border-l-4 p-4 rounded-lg shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-sm text-muted-foreground mt-1">
                  {toast.message}
                </p>
              )}
              
              {toast.actions && toast.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {toast.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.variant || 'outline'}
                      onClick={action.action}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Utility functions for common toast types
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'success' as const,
    title,
    message,
    ...options
  }),
  
  error: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'error' as const,
    title,
    message,
    duration: 0, // Don't auto-hide errors
    ...options
  }),
  
  warning: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'warning' as const,
    title,
    message,
    ...options
  }),
  
  info: (title: string, message?: string, options?: Partial<Toast>) => ({
    type: 'info' as const,
    title,
    message,
    ...options
  })
}