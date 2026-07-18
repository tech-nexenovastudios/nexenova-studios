import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  CheckCircle,
  Trash2,
  ShieldAlert,
  Mail,
  Clock,
  Database,
  Info,
  Loader2,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { toast } from 'sonner@2.0.3'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { fetchGames, type Game } from '../../data/dataManager'

interface DeleteAccountPageProps {
  onNavigateHome: () => void
}

const API = `https://${projectId}.supabase.co/functions/v1/make-server-dff5028d`
const GRACE_DAYS = 30

type Mode = 'form' | 'verify' | 'cancel' | 'session'
type TokenState = 'loading' | 'ok' | 'error'

/** Reads ?action=verify|cancel&token=... or ?s=<session>, once per render. */
function readMode(): { mode: Mode; token: string } {
  const params = new URLSearchParams(window.location.search)
  const action = params.get('action')
  const token = params.get('token') || ''
  const session = params.get('s') || ''
  if (session) return { mode: 'session', token: session }
  if ((action === 'verify' || action === 'cancel') && token) {
    return { mode: action, token }
  }
  return { mode: 'form', token: '' }
}

/**
 * Prefill values a game can pass when it opens this page from an in-game
 * "Delete Account" button, e.g.
 *   https://nexenovastudios.com/delete-account?pid=<PlayerId>&project=<UnityProjectId>&email=<optional>
 * Player ID (`pid`) is the important one — the game knows it from
 * AuthenticationService.Instance.PlayerId; `project` from Application.cloudProjectId.
 * `project` is forwarded to the backend, which honors it only if allow-listed.
 */
function readPrefill(): { playerId: string; email: string; game: string; project: string } {
  const p = new URLSearchParams(window.location.search)
  return {
    playerId: (p.get('pid') || p.get('player_id') || '').trim(),
    email: (p.get('email') || '').trim(),
    game: (p.get('game') || '').trim(),
    project: (p.get('project') || p.get('projectId') || '').trim(),
  }
}

export function DeleteAccountPage({ onNavigateHome }: DeleteAccountPageProps) {
  const { mode, token } = useMemo(readMode, [])

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-destructive/10 via-destructive/5 to-transparent">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <Trash2 className="h-6 w-6" />
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Account &amp; Data Deletion
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Delete your account
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Request permanent deletion of your Nexenova Studios game account and its
              associated data. No app install required.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {mode === 'form' && <DeletionForm />}
        {mode === 'session' && <SessionDeleteFlow sessionId={token} onDone={onNavigateHome} />}
        {(mode === 'verify' || mode === 'cancel') && (
          <TokenAction mode={mode} token={token} onDone={onNavigateHome} />
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/* Verify / cancel link handler                                           */
/* ---------------------------------------------------------------------- */

function TokenAction({
  mode,
  token,
  onDone,
}: {
  mode: 'verify' | 'cancel'
  token: string
  onDone: () => void
}) {
  const [state, setState] = useState<TokenState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `${API}/account-deletion/${mode}?token=${encodeURIComponent(token)}`,
          { headers: { Accept: 'application/json', Authorization: `Bearer ${publicAnonKey}` } },
        )
        const result = await res.json()
        if (cancelled) return
        if (result.success) {
          setState('ok')
          setMessage(stripTags(result.message) || 'Done.')
        } else {
          setState('error')
          setMessage(stripTags(result.error) || 'This link is invalid or has expired.')
        }
      } catch {
        if (!cancelled) {
          setState('error')
          setMessage('Something went wrong. Please try again later.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mode, token])

  const title =
    mode === 'verify'
      ? state === 'ok'
        ? 'Deletion confirmed'
        : 'Confirmation link'
      : state === 'ok'
        ? 'Deletion cancelled'
        : 'Cancellation link'

  return (
    <Card className="border-border/60">
      <CardContent className="p-10 text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Processing your request…</p>
          </>
        )}
        {state === 'ok' && (
          <>
            <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{message}</p>
            <Button onClick={onDone}>Back to Home</Button>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{message}</p>
            <Button variant="outline" onClick={onDone}>
              Back to Home
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------------------------------------------- */
/* In-game session flow — immediate delete (ownership proven by token)     */
/* ---------------------------------------------------------------------- */

type SessionInfo = { valid: boolean; expired: boolean; used: boolean; playerMasked: string; game: string | null }

function SessionDeleteFlow({ sessionId, onDone }: { sessionId: string; onDone: () => void }) {
  const [state, setState] = useState<'loading' | 'ready' | 'invalid' | 'deleting' | 'done'>('loading')
  const [info, setInfo] = useState<SessionInfo | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API}/account-deletion/session/${encodeURIComponent(sessionId)}`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        })
        const r = await res.json()
        if (cancelled) return
        if (r.success && r.data?.valid) {
          setInfo(r.data)
          setState('ready')
        } else {
          setState('invalid')
          setMessage(
            r.data?.used
              ? 'This account was already deleted.'
              : r.data?.expired
                ? 'This link has expired. Reopen the deletion screen from the game.'
                : 'This link is invalid. Reopen the deletion screen from the game.',
          )
        }
      } catch {
        if (!cancelled) {
          setState('invalid')
          setMessage('Something went wrong. Please reopen from the game.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const handleDelete = async () => {
    if (!acknowledged) {
      toast.error('Please confirm you understand this is permanent.')
      return
    }
    setState('deleting')
    try {
      const res = await fetch(`${API}/account-deletion/session/${encodeURIComponent(sessionId)}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email: email.trim() || undefined }),
      })
      const r = await res.json()
      if (r.success) {
        setState('done')
      } else {
        // Session-level failures can't be retried here; config/transient can.
        const msg = stripTags(r.error) || 'Deletion failed. Please try again.'
        if (/session|expired|already/i.test(msg)) {
          setState('invalid')
          setMessage(msg)
        } else {
          toast.error(msg)
          setState('ready')
        }
      }
    } catch {
      toast.error('Network error. Please try again.')
      setState('ready')
    }
  }

  if (state === 'loading') {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center">
          <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading your account…</p>
        </CardContent>
      </Card>
    )
  }

  if (state === 'invalid') {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center">
          <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Can&rsquo;t continue</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{message}</p>
          <Button variant="outline" onClick={onDone}>
            Back to Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (state === 'done') {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center">
          <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Account deleted</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Your account and its associated data have been permanently deleted.
            {email.trim() ? ' A confirmation has been sent to your email.' : ''}
          </p>
          <Button onClick={onDone}>Back to Home</Button>
        </CardContent>
      </Card>
    )
  }

  // ready | deleting
  const deleting = state === 'deleting'
  return (
    <div className="space-y-8">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive flex-shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <CardTitle className="text-lg">This deletes your account immediately</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li className="flex gap-2">
              <Database className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
              Your player account (identity), cloud saves, progress, in-game currency
              and inventory, leaderboard entries, and any profile data tied to your account.
            </li>
            <li className="flex gap-2">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
              Takes effect <strong>right away</strong> — there is no grace period and it
              cannot be undone.
            </li>
            <li className="flex gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              We may retain limited records where required by law or for fraud
              prevention, in anonymized or legally-mandated form.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trash2 className="h-5 w-5" />
            Confirm deletion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Signed-in player: </span>
            <span className="font-mono font-medium">{info?.playerMasked}</span>
            {info?.game ? (
              <>
                <span className="text-muted-foreground"> · game: </span>
                <span className="font-medium">{info.game}</span>
              </>
            ) : null}
          </div>

          <div>
            <label className="block text-sm mb-2">Email for confirmation (optional)</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={deleting}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              We&rsquo;ll email a deletion receipt if you provide an address. Not required.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={deleting}
              className="mt-1 h-4 w-4 rounded border-border accent-destructive"
            />
            <span className="text-muted-foreground">
              I understand this permanently deletes my account and data immediately, and
              cannot be undone.
            </span>
          </label>

          <Button
            onClick={handleDelete}
            size="lg"
            variant="destructive"
            className="w-full"
            disabled={deleting || !acknowledged}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete my account permanently
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/* Submission form                                                        */
/* ---------------------------------------------------------------------- */

function DeletionForm() {
  const [games, setGames] = useState<Game[]>([])
  // Prefill from URL params when the game deep-links into this page.
  const prefill = useMemo(readPrefill, [])
  const [form, setForm] = useState({
    playerId: prefill.playerId,
    email: prefill.email,
    game: prefill.game,
    reason: '',
  })
  const prefilledFromGame = prefill.playerId.length > 0
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchGames()
      .then((g) => setGames(g || []))
      .catch(() => setGames([]))
  }, [])

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.playerId.trim() || form.playerId.trim().length < 3) {
      toast.error('Enter your in-game Player ID (Settings → Account).')
      return
    }
    if (!form.email.trim()) {
      toast.error('Enter the email we should send the confirmation to.')
      return
    }
    if (!acknowledged) {
      toast.error('Please acknowledge that deletion is permanent.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/account-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          player_id: form.playerId,
          email: form.email,
          game: form.game || 'not-listed',
          reason: form.reason,
          // Unity project id passed by the in-game deep link; backend honors it
          // only if allow-listed. Omitted for manual/browser submissions.
          project: prefill.project || undefined,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setSubmitted(true)
        toast.success('Confirmation email sent.')
      } else {
        throw new Error(result.error || 'Submission failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center">
          <Mail className="h-14 w-14 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We&rsquo;ve sent a confirmation link to <strong>{form.email}</strong>. Your account
            will <strong>not</strong> be deleted until you click it. The link starts a{' '}
            {GRACE_DAYS}-day grace period during which you can still cancel.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Didn&rsquo;t get it? Check spam, or email tech@nexenovastudios.com.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* What happens */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive flex-shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <CardTitle className="text-lg">What deletion removes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li className="flex gap-2">
              <Database className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
              Your player account (identity), cloud saves, progress, in-game currency
              and inventory, leaderboard entries, and any profile data tied to your Player ID.
            </li>
            <li className="flex gap-2">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
              Deletion is permanent and takes effect after a {GRACE_DAYS}-day grace
              period. It cannot be undone once complete.
            </li>
            <li className="flex gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              We may retain limited records where required by law or for fraud
              prevention (e.g. purchase/transaction receipts), for the minimum period
              required, in anonymized or legally-mandated form.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trash2 className="h-5 w-5" />
            Request deletion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2">
                In-game Player ID <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.playerId}
                onChange={(e) => set('playerId', e.target.value)}
                placeholder="e.g. AbC123XyZ..."
                disabled={submitting}
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {prefilledFromGame ? (
                  <>Detected from your game — confirm it&rsquo;s correct before submitting.</>
                ) : (
                  <>
                    Open the game → <strong>Settings → Account</strong> to find your Player ID.
                    This is how we locate the exact account to delete.
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                  disabled={submitting}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  We send a confirmation link here.
                </p>
              </div>
              <div>
                <label className="block text-sm mb-2">Game</label>
                <Select value={form.game} onValueChange={(v) => set('game', v)} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="not-listed">Other / not listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Reason (optional)</label>
              <Textarea
                value={form.reason}
                onChange={(e) => set('reason', e.target.value)}
                rows={3}
                placeholder="Anything you'd like us to know."
                disabled={submitting}
              />
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={submitting}
                className="mt-1 h-4 w-4 rounded border-border accent-destructive"
              />
              <span className="text-muted-foreground">
                I understand this permanently deletes my account and data after a{' '}
                {GRACE_DAYS}-day grace period, and cannot be undone once complete.
              </span>
            </label>

            <Button
              type="submit"
              size="lg"
              variant="destructive"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Request account deletion
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Prefer to delete in-game? Most Nexenova games have{' '}
              <strong>Settings → Account → Delete Account</strong> for instant removal.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

/** Strip any HTML tags the API embedded in a message for safe plain-text display. */
function stripTags(s?: string): string {
  return (s || '').replace(/<[^>]*>/g, '')
}
