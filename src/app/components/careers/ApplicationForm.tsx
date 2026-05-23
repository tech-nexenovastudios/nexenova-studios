import { useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Loader2, Send, Upload } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { extractFieldsFromFile } from '../../utils/resumeExtract'

interface ApplicationFormProps {
  roleSlug: string
  roleTitle: string
}

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const MAX_BYTES = 5 * 1024 * 1024 // keep in sync with the bucket file_size_limit

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  { auth: { persistSession: false } },
)

function slugifySegment(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'applicant'
}

export function ApplicationForm({ roleSlug, roleTitle }: ApplicationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    portfolio: '',
    cover_letter: '',
  })
  const [resume, setResume] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setResume(null)
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error(`Resume is over 5MB. Please trim it down.`)
      e.target.value = ''
      setResume(null)
      return
    }
    setResume(file)

    // Try to extract name/email/portfolio from the resume and fill any
    // empty fields. Never overwrite what the user has already typed.
    setIsParsing(true)
    try {
      const extracted = await extractFieldsFromFile(file)
      const filled: string[] = []
      setForm((prev) => {
        const next = { ...prev }
        if (extracted.name && !prev.name) {
          next.name = extracted.name
          filled.push('name')
        }
        if (extracted.email && !prev.email) {
          next.email = extracted.email
          filled.push('email')
        }
        if (extracted.portfolio && !prev.portfolio) {
          next.portfolio = extracted.portfolio
          filled.push('portfolio')
        }
        return next
      })
      if (filled.length > 0) {
        toast.success(`Pulled ${filled.join(', ')} from your resume — double-check before submitting.`)
      }
    } catch (err) {
      console.warn('Resume auto-fill failed:', err)
    } finally {
      setIsParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.cover_letter || !resume) {
      toast.error('Name, email, cover letter, and a resume are all required.')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Upload resume to private storage
      const ext = resume.name.split('.').pop()?.toLowerCase() || 'pdf'
      const path = `${roleSlug}/${Date.now()}-${slugifySegment(form.name)}.${ext}`
      const upload = await supabase.storage
        .from('career-applications')
        .upload(path, resume, {
          contentType: resume.type || 'application/octet-stream',
          upsert: false,
        })

      if (upload.error) {
        throw new Error(upload.error.message || 'Resume upload failed')
      }

      // 2. POST metadata to the Edge Function (which emails and signs the URL)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dff5028d/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...form,
            role_slug: roleSlug,
            role_title: roleTitle,
            resume_path: path,
            resume_filename: resume.name,
          }),
        },
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Application could not be sent')
      }

      setIsSubmitted(true)
      toast.success("Application received. We'll be in touch.")
      setForm({ name: '', email: '', portfolio: '', cover_letter: '' })
      setResume(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Application submission error:', err)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please email tech@nexenovastudios.com directly.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-10">
        <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">Application received.</h3>
        <p className="text-sm text-muted-foreground">
          We&rsquo;ll review it and get back to you at the email you provided.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2">Your name *</label>
          <Input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Riley"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Email *</label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="riley@example.com"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2">Portfolio / reel URL</label>
        <Input
          type="url"
          name="portfolio"
          value={form.portfolio}
          onChange={handleChange}
          placeholder="https://your-portfolio.com"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Why this role? *</label>
        <Textarea
          name="cover_letter"
          value={form.cover_letter}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Tell us about a project you shipped and what you would bring to this role. Short is better."
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Resume * <span className="text-muted-foreground font-normal">(PDF or DOC, max 5MB)</span></label>
        <div className="flex items-center gap-3">
          <label
            htmlFor="resume-input"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="h-4 w-4" />
            Choose file
          </label>
          <input
            id="resume-input"
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFile}
            required
            disabled={isSubmitting}
            className="hidden"
          />
          <span className="text-sm text-muted-foreground truncate flex items-center gap-2">
            {resume ? resume.name : 'No file chosen'}
            {isParsing && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                reading…
              </span>
            )}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          We&rsquo;ll try to auto-fill your name, email, and portfolio link from the resume. Double-check before submitting.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit application
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your resume is stored privately. Only the studio can read it. Trouble submitting?{' '}
        <a href={`mailto:tech@nexenovastudios.com?subject=${encodeURIComponent(`${roleTitle} — application`)}`} className="text-primary hover:underline">
          Email us directly
        </a>
        .
      </p>
    </form>
  )
}
