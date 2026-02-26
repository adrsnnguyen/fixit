import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Wrench, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  // Already logged in — redirect away
  if (!loading && session) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/role-select`,
      },
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    // If session is null, Supabase requires email confirmation first
    if (!data.session) {
      setConfirmationSent(true)
      setSubmitting(false)
      return
    }

    // Email confirmation is disabled — session is live, proceed directly
    navigate('/auth/role-select', { replace: true })
  }

  // ── Email confirmation pending screen ─────────────────────────────────────
  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-foreground">{email}</span>. Click
            it to verify your account and finish setting up your profile.
          </p>
          <p className="text-xs text-muted">
            Didn't get it? Check your spam folder.
          </p>
          <Link
            to="/login"
            className="block text-sm text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">FixIt</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-1">
          Create your account
        </h1>
        <p className="text-muted text-center text-sm mb-8">
          Get started with FixIt today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Jane Smith"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
