import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Home, Wrench, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../contexts/AuthContext'

interface RoleCard {
  role: Exclude<UserRole, null>
  icon: React.ReactNode
  title: string
  description: string
  perks: string[]
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'homeowner',
    icon: <Home className="w-7 h-7" />,
    title: 'Homeowner',
    description: 'I need help with home services',
    perks: ['Browse local professionals', 'Get instant quotes', 'Track jobs in real-time'],
  },
  {
    role: 'provider',
    icon: <Wrench className="w-7 h-7" />,
    title: 'Service Provider',
    description: 'I offer home services',
    perks: ['Grow your client base', 'Manage bookings easily', 'Get paid fast'],
  },
]

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [selected, setSelected] = useState<Exclude<UserRole, null> | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Show spinner while session is resolving (e.g. after email confirmation redirect)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const handleContinue = async () => {
    if (!selected) return
    setSubmitting(true)

    const { error } = await supabase.auth.updateUser({
      data: { role: selected },
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    toast.success('Welcome to FixIt!')
    // Providers start with onboarding; homeowners go to dashboard
    navigate(selected === 'provider' ? '/onboarding' : '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">FixIt</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-1">
          How will you use FixIt?
        </h1>
        <p className="text-muted text-center text-sm mb-8">
          Choose your role — you can only pick one
        </p>

        {/* Role cards */}
        <div className="space-y-3 mb-6">
          {ROLE_CARDS.map(({ role, icon, title, description, perks }) => {
            const isSelected = selected === role
            return (
              <button
                key={role}
                onClick={() => setSelected(role)}
                className={[
                  'w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98]',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface hover:border-primary/40',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                      isSelected ? 'bg-primary text-white' : 'bg-background text-muted',
                    ].join(' ')}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted mt-0.5">{description}</p>
                    <ul className="mt-2 space-y-1">
                      {perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-1.5 text-xs text-muted">
                          <span
                            className={[
                              'w-1.5 h-1.5 rounded-full shrink-0',
                              isSelected ? 'bg-primary' : 'bg-border',
                            ].join(' ')}
                          />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={[
                      'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                      isSelected ? 'border-primary bg-primary' : 'border-border',
                    ].join(' ')}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || submitting}
          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            'Setting up your account…'
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
